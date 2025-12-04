import Membership from "../models/Membership";
import User from "../models/User";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { Router, Request, Response, NextFunction } from "express";
const router = Router();

// User chọn Membership sau khi login
router.post("/choose-membership", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId, username ,name, duration, price } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!["Standard", "Premium", "Elite"].includes(name)) {
      return res.status(400).json({ message: "Invalid membership type" });
    }

    // Tìm user theo ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tạo membership mới (status = pending)
    const newMembership = new Membership({
      user: userId,   // <-- CORRECT FIELD
      username: username,     
      name: name,
      duration: duration || 30,
      price: price,
      status: "pending"
      // createdDate & expiredDate sẽ tự set trong pre("save")
    });

    await newMembership.save();

    // Gắn membership vào user
    user.membership = newMembership._id;
    await user.save();

    res.status(201).json({
      message: "Membership created and assigned to user",
      membership: newMembership,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error choosing membership", error: err });
  }
});



export default router;