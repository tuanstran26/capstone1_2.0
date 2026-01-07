import Relationship from "../models/Relationship";
import User from "../models/User";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { Router, Request, Response, NextFunction } from "express";
const router = Router();


// Tìm kiếm PT theo tên
router.get(
  "/trainers-search",
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // regex tìm theo firstname hoặc lastname
      const trainers = await User.find({
        role: "pt",
        $or: [
          { firstname: { $regex: query, $options: "i" } },
          { lastname: { $regex: query, $options: "i" } },
        ],
      }).select("_id firstname lastname ptSpecialization ptExperience");

      res.json(trainers);
    } catch (err) {
      res.status(500).json({ message: "Error searching trainers", error: err });
    }
  }
);


// Gán PT cho user
router.post("/assign-pt", async (req: Request, res: Response) => {
  try {
    const { ptId, userId, ptName, userName, status } = req.body;

    if (!ptId || !userId || !ptName || !userName) {
      return res.status(400).json({
        message: "ptId, userId, ptName and userName are required",
      });
    }

    // Create relationship
    const relationship = await Relationship.create({
      ptId,
      userId,
      ptName,
      userName,
      status: status ?? "pending", // default if FE không gửi
    });

    res.status(201).json({
      message: "PT assignment created successfully",
      relationship,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error creating PT assignment",
      error: err,
    });
  }
});


// Get PT profile theo ID
router.get("/trainer/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const ptId = req.params.id;

    if (!ptId) {
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    const trainer = await User.findOne({ _id: ptId, role: "pt" }).select(
      "_id firstname lastname email phonenumber ptSpecialization ptExperience ptClients createdAt updatedAt"
    );

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json(trainer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching trainer", error: err });
  }
});


// Tìm user theo id
router.get("/find-user/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password");


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user", error: err });
  }
});


router.get(
  "/get-pts",
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const pts = await User.find({ role: "pt" }).select("-password");

      return res.status(200).json(pts);
    } catch (err) {
      console.error("Get PT users error:", err);
      return res.status(500).json({
        message: "Error fetching PT users",
        error: err,
      });
    }
  }
);

export default router;