
import express, { Request, Response } from "express";
import Product from "../models/Product"; // đường dẫn schema của bạn
import { ensureAuthenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/create", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const {
            name,
            slug,
            description,
            shortDescription,
            brand,
            category,
            images,
            status,
            rating
        } = req.body;

        // Validate required fields
        if (!name || !slug || !description || !shortDescription || !brand || !category) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        // Create Product Document
        const newProduct = new Product({
            name,
            slug,
            description,
            shortDescription,
            brand,
            category,
            images: images || [],
            status: status || "active",
            rating: rating || { avg: 0, count: 0 },
        });

        const savedProduct = await newProduct.save();

        return res.status(201).json({
            message: "Product created successfully",
            product: savedProduct,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error creating product",
            error: err,
        });
    }
});

export default router;
