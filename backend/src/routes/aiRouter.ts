import { Router, Request, Response } from "express";
import Product from "../models/Product";
import Schedule from "../models/Schedule";
import User from "../models/User";

const router = Router();

router.post("/products/filter", async (req, res) => {
    try {
        const {
            category = "",
            brand = "",
            minPrice = "",
            maxPrice = "",
        } = req.body;

        // filter bắt buộc
        const filter: any = {
            status: "active",
            inStock: { $gt: 1 },
        };

        // ===== category =====
        if (typeof category === "string" && category.trim() !== "") {
            filter.category = category.trim();
        }

        // ===== brand =====
        if (typeof brand === "string" && brand.trim() !== "") {
            filter.brand = brand.trim();
        }

        // ===== price range (FIXED) =====
        if (minPrice !== "" || maxPrice !== "") {
            filter.price = {};

            if (minPrice !== "") {
                const min = Number(minPrice);
                if (!isNaN(min)) {
                    filter.price.$gte = min;
                }
            }

            if (maxPrice !== "") {
                const max = Number(maxPrice);
                if (!isNaN(max)) {
                    filter.price.$lte = max;
                }
            }
        }

        const products = await Product.find(filter).select(
            "name description price brand category"
        );

        res.status(200).json(
            products,
        );
    } catch (err) {
        console.error("Filter products error:", err);
        res.status(500).json({
            message: "Error filtering products",
            error: err,
        });
    }
});

router.post("/create", async (req, res) => {
    try {
        const { scheduleDate, shift, ptId, ptName, userId, userName } = req.body;

        const scheduleName = `${scheduleDate} - ${shift}`;

        // Tạo schedule mới
        const newSchedule = new Schedule({
            scheduleName,
            scheduleDate,
            shift,
            ptId,
            ptName,
            userId,
            userName,
        });

        await newSchedule.save();

        return res.json({ message: "Schedule created", schedule: newSchedule });
    } catch (err: any) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: "Schedule for this date & shift already exists",
            });
        }

        return res.status(500).json({
            message: "Error creating schedule",
            error: err,
        });
    }
});


router.get(
    "/trainer/:id",
    async (req: Request, res: Response) => {
        try {
            const ptId = req.params.id;

            if (!ptId) {
                return res.status(400).json({ message: "Trainer ID is required" });
            }

            const trainer = await User.findOne(
                { _id: ptId, role: "pt" },
                "firstname lastname"
            );

            if (!trainer) {
                return res.status(404).json({ message: "Trainer not found" });
            }

            const fullName = `${trainer.firstname} ${trainer.lastname}`;

            return res.json({ ptName: fullName });
        } catch (err) {
            console.error(err);
            return res
                .status(500)
                .json({ message: "Error fetching trainer name", error: err });
        }
    }
);


export default router;
