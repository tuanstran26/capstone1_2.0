import { Router, Request, Response } from "express";
import User from "../models/User";
import Membership from "../models/Membership";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/authMiddleware";

const router = Router();

/**
 * 1. Lấy danh sách user (không phải admin, không phải pt)
 */
router.get("/users", ensureAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $nin: ["admin", "pt"] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});

/**
 * 2. Lấy danh sách membership
 */
router.get("/memberships", ensureAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const memberships = await Membership.find();
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: "Error fetching memberships", error: err });
  }
});

/**
 * 3. Lấy danh sách PT
 */
router.get("/pts", ensureAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const pts = await User.find({ role: "pt" });
    res.json(pts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching PTs", error: err });
  }
});

/**
 * Xóa user theo id
 */
router.delete("/users/:id", ensureAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err });
  }
});

/**
 * Xóa PT theo id
 */
router.delete("/pts/:id", ensureAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, role: "pt" });
    res.json({ message: "PT deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting PT", error: err });
  }
});

/**
 * Thay đổi status của membership
 */
router.patch("/memberships/:id/status", ensureAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["pending", "active", "expired"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    res.json({ message: "Membership status updated", membership });
  } catch (err) {
    res.status(500).json({ message: "Error updating membership", error: err });
  }
});



// Lấy toàn bộ user trừ admin
router.get("/all-users", ensureAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $nin: "admin" } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});


// Lấy thông tin membership theo ID
router.get(
  "/memberships/:id",
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const membership = await Membership.findById(id);

      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }

      res.json(membership);
    } catch (err) {
      res.status(500).json({
        message: "Error fetching membership",
        error: err,
      });
    }
  }
);





export default router;
