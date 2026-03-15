import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { createNotification } from "./notificationRouter";

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

            // Send notification to user about order status
            try {
                const statusMessages: Record<string, { type: any; title: string; message: string }> = {
                    pending: {
                        type: "order_placed",
                        title: "Order Processing",
                        message: `Order #${orderId.slice(-6).toUpperCase()} is being processed.`
                    },
                    shipping: {
                        type: "order_shipped",
                        title: "Order Shipped",
                        message: `Order #${orderId.slice(-6).toUpperCase()} is on its way to you.`
                    },
                    completed: {
                        type: "order_delivered",
                        title: "Order Delivered",
                        message: `Order #${orderId.slice(-6).toUpperCase()} has been delivered successfully.`
                    }
                };

                const notifData = statusMessages[status];
                if (notifData && order.userId) {
                    await createNotification(
                        order.userId.toString(),
                        notifData.type,
                        notifData.title,
                        notifData.message,
                        { orderId: order._id, status }
                    );
                }
            } catch (notifError) {
                console.error("Error sending order notification:", notifError);
            }

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
