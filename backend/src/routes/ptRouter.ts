import Relationship from "../models/Relationship";
import User from "../models/User";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { Router, Request, Response, NextFunction } from "express";
const router = Router();
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createNotification } from "./notificationRouter";

// Configure multer for avatar upload
const uploadDir = path.join(__dirname, "../../uploads/avatars");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


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

            // Notify PT about new client
            try {
              await createNotification(
                (ptId as any).toString(),
                "new_client",
                "New Client Assigned!",
                `${user.firstname} ${user.lastname} has been assigned to you as a client.`,
                { userId: userId, clientName: `${user.firstname} ${user.lastname}` }
              );
            } catch (notifError) {
              console.error("Error sending new client notification:", notifError);
            }

            // Notify User about PT assignment
            try {
              await createNotification(
                (userId as any).toString(),
                "pt_assigned",
                "Personal Trainer Assigned!",
                `${pt.firstname} ${pt.lastname} is now your personal trainer.`,
                { ptId: ptId, trainerName: `${pt.firstname} ${pt.lastname}` }
              );
            } catch (notifError) {
              console.error("Error sending PT assigned notification:", notifError);
            }

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

        const relationship = await Relationship.findById(id);
        if (!relationship) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        relationship.status = "rejected";
        await relationship.save();

        // Notify user about rejection
        try {
          const pt = await User.findById(relationship.ptId);
          await createNotification(
            (relationship.userId as any).toString(),
            "system",
            "Request Declined",
            `Trainer ${relationship.ptName || (pt ? `${pt.firstname} ${pt.lastname}` : 'PT')} has declined your training request.`,
            { relationshipId: id, ptId: relationship.ptId }
          );
          console.log(`📢 Notification sent to user ${relationship.userId} about PT rejection`);
        } catch (notifError) {
          console.error("Error sending rejection notification:", notifError);
        }

        res.json({ message: "Assignment rejected", relationship });
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


// Upload avatar for PT
router.post(
    "/upload-avatar/:id",
    ensureAuthenticated,
    upload.single("avatar"),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            // Find PT
            const pt = await User.findById(id);

            if (!pt) {
                // Delete uploaded file if PT not found
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ message: "PT not found" });
            }

            if (pt.role !== "pt") {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: "User is not a trainer" });
            }

            // Delete old avatar if exists
            if (pt.ptAvatar) {
                const oldAvatarPath = path.join(uploadDir, path.basename(pt.ptAvatar));
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }

            // Update ptAvatar with the file path
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            pt.ptAvatar = avatarUrl;
            await pt.save();

            res.json({
                message: "Avatar uploaded successfully",
                avatarUrl,
                pt: {
                    _id: pt._id,
                    firstname: pt.firstname,
                    lastname: pt.lastname,
                    ptAvatar: pt.ptAvatar
                }
            });
        } catch (err) {
            console.error("Error uploading avatar:", err);
            // Clean up file on error
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({
                message: "Server error uploading avatar",
                error: err,
            });
        }
    }
);


// Update PT profile
router.patch(
    "/update-profile/:id",
    ensureAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { ptSpecialization, ptExperience } = req.body;

            const pt = await User.findById(id);

            if (!pt) {
                return res.status(404).json({ message: "PT not found" });
            }

            if (pt.role !== "pt") {
                return res.status(400).json({ message: "User is not a trainer" });
            }

            // Update only allowed fields
            if (ptSpecialization !== undefined) {
                pt.ptSpecialization = ptSpecialization;
            }
            if (ptExperience !== undefined) {
                pt.ptExperience = ptExperience;
            }

            await pt.save();

            res.json({
                message: "Profile updated successfully",
                pt: {
                    _id: pt._id,
                    firstname: pt.firstname,
                    lastname: pt.lastname,
                    ptSpecialization: pt.ptSpecialization,
                    ptExperience: pt.ptExperience
                }
            });
        } catch (err) {
            console.error("Error updating profile:", err);
            res.status(500).json({
                message: "Server error updating profile",
                error: err,
            });
        }
    }
);


// Delete avatar for PT
router.delete(
    "/delete-avatar/:id",
    ensureAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const pt = await User.findById(id);

            if (!pt) {
                return res.status(404).json({ message: "PT not found" });
            }

            if (pt.role !== "pt") {
                return res.status(400).json({ message: "User is not a trainer" });
            }

            if (pt.ptAvatar) {
                const avatarPath = path.join(uploadDir, path.basename(pt.ptAvatar));
                if (fs.existsSync(avatarPath)) {
                    fs.unlinkSync(avatarPath);
                }
                pt.ptAvatar = null;
                await pt.save();
            }

            res.json({ message: "Avatar deleted successfully" });
        } catch (err) {
            console.error("Error deleting avatar:", err);
            res.status(500).json({
                message: "Server error deleting avatar",
                error: err,
            });
        }
    }
);


export default router;