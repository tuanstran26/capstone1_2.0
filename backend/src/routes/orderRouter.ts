import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import { ensureAuthenticated } from "../middlewares/authMiddleware";

const router = express.Router();


// Lấy toàn bộ order
router.get(
    '/all-orders',
    ensureAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const orders = await Order.find()
                .sort({ createdAt: -1 });

            res.status(200).json({
                total: orders.length,
                orders,
            });
        } catch (err) {
            console.error('Fetch all orders error:', err);
            res.status(500).json({
                message: 'Error fetching orders',
                error: err,
            });
        }
    }
);



// Lấy toàn bộ order theo userId
router.get(
    "/get-orders/:userId",
    ensureAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: "Invalid userId" });
            }

            const orders = await Order.find({ userId })
                .sort({ createdAt: -1 }); // newest first

            return res.status(200).json({
                total: orders.length,
                orders,
            });
        } catch (err) {
            console.error("Error fetching orders by user:", err);
            return res.status(500).json({
                message: "Error fetching orders",
                error: err,
            });
        }
    }
);

router.put(
    "/:orderId/status",
    ensureAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            // Validate orderId
            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({ message: "Invalid orderId" });
            }

            // Validate status
            const allowedStatus = ["pending", "shipping", "completed"];
            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status",
                    allowedStatus,
                });
            }

            // Find order
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }


            // Update status
            order.status = status;
            await order.save();

            return res.status(200).json({
                message: "Order status updated successfully",
                order,
            });
        } catch (err) {
            console.error("Update order status error:", err);
            return res.status(500).json({
                message: "Error updating order status",
                error: err,
            });
        }
    }
);



export default router;
