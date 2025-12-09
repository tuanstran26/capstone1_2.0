import Relationship from "../models/Relationship";
import User from "../models/User";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { Router, Request, Response, NextFunction } from "express";
const router = Router();
import mongoose from "mongoose";


//Approve PT assignment
router.patch(
    "/assign-pt/:id/approve",
    ensureAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Lấy relationship
            const relationship = await Relationship.findById(id);
            if (!relationship) {
                return res.status(404).json({ message: "Assignment not found" });
            }

            if (relationship.status === "active") {
                return res.status(400).json({ message: "Assignment already active" });
            }

            // Cập nhật status => active
            relationship.status = "active";
            await relationship.save();

            // Lấy PT & User
            const pt = await User.findById(relationship.ptId);
            const user = await User.findById(relationship.userId);

            if (!pt || !user) {
                return res.status(404).json({ message: "PT or User not found" });
            }

            // Fix: luôn đảm bảo ptClients là array
            if (!Array.isArray(pt.ptClients)) {
                pt.ptClients = [];
            }

            const ptId = pt._id as mongoose.Types.ObjectId;
            const userId = user._id as mongoose.Types.ObjectId;

            // Check client exists safely
            const alreadyClient = pt.ptClients.some((c: any) => {
                if (!c || !c.userId) return false;
                return c.userId.toString() === userId.toString();
            });

            // If not exist → push
            if (!alreadyClient) {
                pt.ptClients.push({
                    userId: userId,
                    name: `${user.firstname} ${user.lastname}`,
                } as any);
            }

            // Assign PT to user
            user.assignedPT = ptId;

            await Promise.all([pt.save(), user.save()]);

            return res.json({
                message: "Assignment approved & PT/User updated",
                relationship,
            });
        } catch (err) {
            console.error("Error approving assignment:", err);
            return res.status(500).json({
                message: "Server error updating assignment",
                error: err,
            });
        }
    }
);

//Reject PT assignment
router.patch("/assign-pt/:id/reject", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const updated = await Relationship.findByIdAndUpdate(
            id,
            { status: "rejected" },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        res.json({ message: "Assignment rejected", relationship: updated });
    } catch (err) {
        res.status(500).json({ message: "Error updating assignment", error: err });
    }
});


// Update PT profile
router.patch(
    "/update-profile/:id",
    ensureAuthenticated, // or ensure trainer role
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { ptSpecialization, ptExperience } = req.body;

            // Validate body
            if (!ptSpecialization && !ptExperience) {
                return res.status(400).json({
                    message: "At least one field (specialization or experience) must be provided",
                });
            }

            // Find PT
            const pt = await User.findById(id);

            if (!pt) {
                return res.status(404).json({ message: "PT not found" });
            }

            if (pt.role !== "pt") {
                return res.status(400).json({ message: "User is not a trainer" });
            }

            // Update values if provided
            if (ptSpecialization) pt.ptSpecialization = ptSpecialization;
            if (ptExperience) pt.ptExperience = ptExperience;

            await pt.save();

            res.json({
                message: "PT profile updated successfully",
                pt,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Server error updating PT profile",
                error: err,
            });
        }
    }
);


router.get("/relationships/:ptId", async (req: Request, res: Response) => {
    try {
        const { ptId } = req.params;

        if (!ptId) {
            return res.status(400).json({ message: "PT ID is required" });
        }

        const relationships = await Relationship.find({ ptId }).sort({ createdAt: -1 });

        res.json(relationships);
    } catch (err) {
        console.error("Error fetching relationships:", err);
        res.status(500).json({ message: "Server error fetching relationships", error: err });
    }
});


router.get("/users", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const idsParam = req.query.ids as string;
        if (!idsParam) {
            return res.status(400).json({ message: "No user IDs provided" });
        }

        const idsArray = idsParam
            .split(",")
            .map((id) => new mongoose.Types.ObjectId(id.trim()));

        const users = await User.find({ _id: { $in: idsArray } }).select(
            "_id firstname lastname email phonenumber dob gender role"
        );

        res.json(users);
    } catch (err) {
        console.error("Error fetching users by IDs:", err);
        res.status(500).json({ message: "Server error fetching users", error: err });
    }
});



export default router;