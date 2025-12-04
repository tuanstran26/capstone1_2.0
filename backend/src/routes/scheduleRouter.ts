import Relationship from "../models/Relationship";
import User from "../models/User";
import Schedule from "../models/Schedule";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { Router, Request, Response, NextFunction } from "express";
const router = Router();


router.post("/create", ensureAuthenticated, async (req, res) => {
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


router.get("/user/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const schedules = await Schedule.find({ userId })
      .sort({ date: -1 })
      .select(
        "_id scheduleName date shift ptId ptName userId userName createdAt"
      );

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ message: "No schedules found for this user" });
    }

    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching schedules", error: err });
  }
});

router.get("/trainer/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const ptId = req.params.id;

    if (!ptId) {
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    const schedules = await Schedule.find({ ptId })
      .sort({ date: -1 })
      .select(
        "_id scheduleName date shift ptId ptName userId userName createdAt"
      );

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ message: "No schedules found for this trainer" });
    }

    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching schedules", error: err });
  }
});



export default router;