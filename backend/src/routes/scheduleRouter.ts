import Relationship from "../models/Relationship";
import User from "../models/User";
import Schedule from "../models/Schedule";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { Router, Request, Response, NextFunction } from "express";
import { createNotification } from "./notificationRouter";
const router = Router();


router.post("/create", ensureAuthenticated, async (req, res) => {
    try {
        const { scheduleDate, shift, ptId, ptName, userId, userName } = req.body;

        const scheduleName = `${scheduleDate} - ${shift}`;

        // Tạo schedule mới với status pending
        const newSchedule = new Schedule({
            scheduleName,
            scheduleDate,
            shift,
            ptId,
            ptName,
            userId,
            userName,
            status: "pending",
        });

        await newSchedule.save();

        // Notify PT about new schedule
        try {
          await createNotification(
            ptId,
            "schedule_created",
            "New Training Session",
            `${userName} has scheduled a session on ${scheduleDate} (${shift}).`,
            { scheduleId: newSchedule._id, userId, scheduleDate, shift }
          );
        } catch (notifError) {
          console.error("Error sending schedule notification to PT:", notifError);
        }

        // Notify User about schedule submission (pending approval)
        try {
          await createNotification(
            userId,
            "schedule_created",
            "Session Request Sent",
            `Your training session request with ${ptName} on ${scheduleDate} (${shift}) has been submitted and is awaiting trainer approval.`,
            { scheduleId: newSchedule._id, ptId, scheduleDate, shift, status: "pending" }
          );
        } catch (notifError) {
          console.error("Error sending schedule notification to User:", notifError);
        }

        return res.json({ message: "Schedule request submitted! Awaiting trainer approval.", schedule: newSchedule });
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
        "_id scheduleName date shift ptId ptName userId userName status createdAt"
      );

    // Return empty array instead of 404 when no schedules found
    res.json(schedules || []);
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
        "_id scheduleName date shift ptId ptName userId userName status createdAt"
      );

    // Return empty array instead of 404 when no schedules found
    res.json(schedules || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching schedules", error: err });
  }
});


// Approve schedule (for trainer)
router.put("/approve/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const scheduleId = req.params.id;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    schedule.status = "active";
    await schedule.save();

    // Notify user about approval
    try {
      await createNotification(
        schedule.userId.toString(),
        "schedule_created",
        "Session Approved!",
        `Your training session on ${schedule.scheduleDate} (${schedule.shift}) with ${schedule.ptName} has been approved.`,
        { scheduleId: schedule._id, scheduleDate: schedule.scheduleDate, shift: schedule.shift }
      );
    } catch (notifError) {
      console.error("Error sending approval notification:", notifError);
    }

    res.json({ message: "Schedule approved", schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving schedule", error: err });
  }
});


// Reject schedule (for trainer)
router.put("/reject/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const scheduleId = req.params.id;
    const { reason } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    schedule.status = "rejected";
    await schedule.save();

    // Notify user about rejection
    try {
      await createNotification(
        schedule.userId.toString(),
        "schedule_cancelled",
        "Session Rejected",
        `Your training session on ${schedule.scheduleDate} (${schedule.shift}) with ${schedule.ptName} has been rejected.${reason ? ` Reason: ${reason}` : ""}`,
        { scheduleId: schedule._id, scheduleDate: schedule.scheduleDate, shift: schedule.shift, reason }
      );
    } catch (notifError) {
      console.error("Error sending rejection notification:", notifError);
    }

    res.json({ message: "Schedule rejected", schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting schedule", error: err });
  }
});


export default router;