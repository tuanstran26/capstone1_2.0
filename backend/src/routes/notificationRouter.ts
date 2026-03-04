import express, { Request, Response } from "express";
import Notification, { INotification } from "../models/Notification";
import { ensureAuthenticated, isAdmin } from "../middlewares/authMiddleware";
import { getIO } from "../socket";

const router = express.Router();

// ============ USER ROUTES ============

// GET /notification - Lấy tất cả notification của user hiện tại
router.get("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query: any = { recipient: user._id };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: user._id,
      isRead: false,
    });

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /notification/unread-count - Lấy số notification chưa đọc
router.get("/unread-count", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    const count = await Notification.countDocuments({
      recipient: user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /notification/:id/read - Đánh dấu notification đã đọc
router.put("/:id/read", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /notification/read-all - Đánh dấu tất cả đã đọc
router.put("/read-all", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    await Notification.updateMany(
      { recipient: user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /notification/:id - Xóa notification
router.delete("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /notification - Xóa tất cả notification của user
router.delete("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    await Notification.deleteMany({ recipient: user._id });
    res.json({ message: "All notifications deleted" });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============ ADMIN ROUTES ============

// POST /notification/send - Admin gửi notification đến user cụ thể
router.post("/send", isAdmin, async (req: Request, res: Response) => {
  try {
    const { recipientId, type, title, message, data } = req.body;

    if (!recipientId || !type || !title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    });

    await notification.save();

    // Emit real-time notification
    const io = getIO();
    io.to(`user_${recipientId}`).emit("new_notification", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /notification/broadcast - Admin gửi notification đến tất cả users
router.post("/broadcast", isAdmin, async (req: Request, res: Response) => {
  try {
    const { type, title, message, data, role } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Import User model để lấy danh sách users
    const User = require("../models/User").default;
    
    const query: any = {};
    if (role) {
      query.role = role; // Gửi cho role cụ thể (user, pt, admin)
    }

    const users = await User.find(query).select("_id");
    
    const notifications = users.map((user: any) => ({
      recipient: user._id,
      type,
      title,
      message,
      data,
    }));

    const savedNotifications = await Notification.insertMany(notifications);

    // Emit real-time notification to all users
    const io = getIO();
    users.forEach((user: any) => {
      io.to(`user_${user._id}`).emit("new_notification", {
        type,
        title,
        message,
        data,
        createdAt: new Date(),
      });
    });

    res.status(201).json({
      message: `Broadcast sent to ${users.length} users`,
      count: users.length,
    });
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============ HELPER FUNCTION ============
// Export function để các router khác có thể tạo notification

export async function createNotification(
  recipientId: string,
  type: INotification["type"],
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<INotification> {
  console.log(`📬 createNotification: Creating for user ${recipientId}, type: ${type}, title: ${title}`);
  
  const notification = new Notification({
    recipient: recipientId,
    type,
    title,
    message,
    data,
  });

  await notification.save();
  console.log(`✅ Notification saved to DB with ID: ${notification._id}`);

  // Emit real-time notification
  try {
    const io = getIO();
    const room = `user_${recipientId}`;
    io.to(room).emit("new_notification", notification);
    console.log(`📡 Emitted new_notification to room: ${room}`);
  } catch (error) {
    console.error("Socket.io not initialized, skipping real-time emit");
  }

  return notification;
}

export default router;
