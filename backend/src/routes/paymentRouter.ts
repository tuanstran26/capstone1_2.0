import express, { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import Payment from "../models/Payment";
import Membership from "../models/Membership";
import Order from "../models/Order";
import User from "../models/User";
import Cart from "../models/Cart";
import { ensureAuthenticated } from "../middlewares/authMiddleware";

const router = express.Router();

// ============================================
// ZALOPAY SANDBOX CONFIGURATION
// Đây là thông tin test của ZaloPay Sandbox
// Bạn có thể test thanh toán với số tiền nhỏ
// ============================================
const ZALOPAY_CONFIG = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  query_endpoint: "https://sb-openapi.zalopay.vn/v2/query",
  refund_endpoint: "https://sb-openapi.zalopay.vn/v2/refund",
};

// Membership plans configuration
const MEMBERSHIP_PLANS = {
  standard: {
    name: "Standard",
    priceVND: 500000,
    duration: 30,
    features: [
      "Gym access",
      "Personal locker",
      "Shower room",
      "Join 2 group classes/week",
      "Basic fitness assessment",
    ],
  },
  premium: {
    name: "Premium",
    priceVND: 800000,
    duration: 30,
    features: [
      "All Standard features",
      "Unlimited group class access",
      "Personal nutrition consultation",
      "1 PT session/month",
      "Spa access",
      "Free nutritional drinks",
    ],
  },
};

// Helper function to generate ZaloPay MAC (HMAC SHA256)
function generateZaloPayMAC(data: string, key: string): string {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

// Helper function to generate app_trans_id
function generateAppTransId(): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${yy}${mm}${dd}_${timestamp}_${random}`;
}

// ============================================
// ZALOPAY MEMBERSHIP PAYMENT
// ============================================

/**
 * Create ZaloPay payment for Membership
 * POST /payment/membership/zalopay
 */
router.post(
  "/membership/zalopay",
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { userId, planId, personalInfo } = req.body;

      // Validate input
      if (!userId || !planId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const plan = MEMBERSHIP_PLANS[planId as keyof typeof MEMBERSHIP_PLANS];
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has an active membership
      if (user.membership) {
        const existingMembership = await Membership.findById(user.membership);
        if (existingMembership && existingMembership.status === "completed") {
          return res.status(400).json({
            message: "You already have an active membership",
          });
        }
      }

      // Create pending membership
      const membership = new Membership({
        user: userId,
        username: personalInfo?.fullName || `${user.firstname} ${user.lastname}`,
        name: plan.name,
        duration: plan.duration,
        price: plan.priceVND,
        status: "pending",
      });
      await membership.save();

      // Generate app_trans_id
      const appTransId = generateAppTransId();

      // Create pending payment record
      const payment = new Payment({
        userId,
        type: "membership",
        referenceId: membership._id,
        refModel: "Membership",
        amount: plan.priceVND,
        currency: "vnd",
        paymentMethod: "zalopay",
        status: "pending",
        zaloPayTransId: appTransId,
        metadata: {
          planName: plan.name,
          planDuration: plan.duration,
          customerEmail: personalInfo?.email || user.email,
          customerName: personalInfo?.fullName || `${user.firstname} ${user.lastname}`,
        },
      });
      await payment.save();

      // Prepare ZaloPay order data
      const membershipId = (membership._id as any).toString();
      const paymentId = (payment._id as any).toString();
      const embed_data = JSON.stringify({
        redirecturl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout/success?type=membership&paymentId=${paymentId}`,
        membershipId: membershipId,
        paymentId: paymentId,
      });

      const items = JSON.stringify([
        {
          itemid: planId,
          itemname: `${plan.name} Membership - 30 days`,
          itemprice: plan.priceVND,
          itemquantity: 1,
        },
      ]);

      const orderData = {
        app_id: parseInt(ZALOPAY_CONFIG.app_id),
        app_user: userId,
        app_trans_id: appTransId,
        app_time: Date.now(),
        expire_duration_seconds: 900, // 15 minutes
        amount: plan.priceVND,
        item: items,
        description: `Fitness Studio - ${plan.name} Membership Payment`,
        embed_data: embed_data,
        bank_code: "",
        callback_url: `${process.env.BACKEND_URL || "http://localhost:5000"}/payment/zalopay/callback`,
      };

      // Generate MAC
      const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
      const mac = generateZaloPayMAC(data, ZALOPAY_CONFIG.key1);

      // Call ZaloPay API
      const response = await axios.post(
        ZALOPAY_CONFIG.endpoint,
        { ...orderData, mac },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      console.log("ZaloPay response:", response.data);

      if (response.data.return_code === 1) {
        // Update payment with ZaloPay order URL
        payment.zaloPayOrderUrl = response.data.order_url;
        await payment.save();

        res.status(200).json({
          success: true,
          order_url: response.data.order_url,
          zp_trans_token: response.data.zp_trans_token,
          paymentId: payment._id,
          membershipId: membership._id,
          app_trans_id: appTransId,
        });
      } else {
        // Payment creation failed
        payment.status = "failed";
        await payment.save();

        res.status(400).json({
          success: false,
          message: response.data.return_message || "Failed to create ZaloPay order",
          return_code: response.data.return_code,
        });
      }
    } catch (error) {
      console.error("Create ZaloPay membership payment error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating payment",
        error: error,
      });
    }
  }
);

// ============================================
// ZALOPAY ORDER/SHOPPING PAYMENT
// ============================================

/**
 * Create ZaloPay payment for Order
 * POST /payment/order/zalopay
 */
router.post(
  "/order/zalopay",
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { cartId, personalInfo, shippingFee = 50000 } = req.body;

      if (!cartId) {
        return res.status(400).json({ message: "Cart ID is required" });
      }

      // Get cart with user info
      const cart = await Cart.findById(cartId).populate("userId");
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      if (!cart.items || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const user = cart.userId as any;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate totals
      const subtotal = cart.totalCartPrice;
      const tax = Math.round(subtotal * 0.08);
      const finalShippingFee = subtotal > 1000000 ? 0 : shippingFee;
      const totalVND = subtotal + tax + finalShippingFee;

      // Create order (pending status)
      const order = new Order({
        userId: user._id,
        username: personalInfo?.fullName || `${user.firstname} ${user.lastname}`,
        email: personalInfo?.email || user.email,
        address: personalInfo?.address || user.address,
        phone: personalInfo?.phone || user.phonenumber,
        items: cart.items,
        payingMethod: "credit",
        totalCartPrice: subtotal,
        shippingFee: finalShippingFee,
        finalPrice: totalVND,
        status: "pending",
      });
      await order.save();

      // Generate app_trans_id
      const appTransId = generateAppTransId();

      // Create pending payment record
      const payment = new Payment({
        userId: user._id,
        type: "order",
        referenceId: order._id,
        refModel: "Order",
        amount: totalVND,
        currency: "vnd",
        paymentMethod: "zalopay",
        status: "pending",
        zaloPayTransId: appTransId,
        metadata: {
          customerEmail: personalInfo?.email || user.email,
          customerName: personalInfo?.fullName || `${user.firstname} ${user.lastname}`,
          cartId: cartId,
          items: cart.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      });
      await payment.save();

      // Prepare ZaloPay order data
      const orderId = (order._id as any).toString();
      const paymentIdStr = (payment._id as any).toString();
      const embed_data = JSON.stringify({
        redirecturl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/shopping/checkout/success?type=order&paymentId=${paymentIdStr}`,
        orderId: orderId,
        paymentId: paymentIdStr,
        cartId: cartId,
      });

      const items = JSON.stringify(
        cart.items.map((item: any) => ({
          itemid: item.productId.toString(),
          itemname: item.name,
          itemprice: item.price,
          itemquantity: item.quantity,
        }))
      );

      const orderData = {
        app_id: parseInt(ZALOPAY_CONFIG.app_id),
        app_user: user._id.toString(),
        app_trans_id: appTransId,
        app_time: Date.now(),
        expire_duration_seconds: 900, // 15 minutes
        amount: totalVND,
        item: items,
        description: `Fitness Studio - Order #${orderId.slice(-8)}`,
        embed_data: embed_data,
        bank_code: "",
        callback_url: `${process.env.BACKEND_URL || "http://localhost:5000"}/payment/zalopay/callback`,
      };

      // Generate MAC
      const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
      const mac = generateZaloPayMAC(data, ZALOPAY_CONFIG.key1);

      // Call ZaloPay API
      const response = await axios.post(
        ZALOPAY_CONFIG.endpoint,
        { ...orderData, mac },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      console.log("ZaloPay order response:", response.data);

      if (response.data.return_code === 1) {
        // Update payment with ZaloPay order URL
        payment.zaloPayOrderUrl = response.data.order_url;
        await payment.save();

        res.status(200).json({
          success: true,
          order_url: response.data.order_url,
          zp_trans_token: response.data.zp_trans_token,
          paymentId: payment._id,
          orderId: order._id,
          app_trans_id: appTransId,
        });
      } else {
        // Payment creation failed
        payment.status = "failed";
        await payment.save();

        res.status(400).json({
          success: false,
          message: response.data.return_message || "Failed to create ZaloPay order",
          return_code: response.data.return_code,
        });
      }
    } catch (error) {
      console.error("Create ZaloPay order payment error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating payment",
        error: error,
      });
    }
  }
);

// ============================================
// ZALOPAY CALLBACK (Webhook)
// ============================================

/**
 * ZaloPay Callback Handler
 * POST /payment/zalopay/callback
 */
router.post("/zalopay/callback", async (req: Request, res: Response) => {
  try {
    const { data: dataStr, mac: reqMac } = req.body;

    // Verify MAC
    const mac = generateZaloPayMAC(dataStr, ZALOPAY_CONFIG.key2);
    if (mac !== reqMac) {
      console.log("Invalid MAC in callback");
      return res.json({ return_code: -1, return_message: "mac not equal" });
    }

    // Parse callback data
    const callbackData = JSON.parse(dataStr);
    console.log("ZaloPay callback data:", callbackData);

    const { app_trans_id, zp_trans_id, embed_data: embedDataStr } = callbackData;
    const embedData = JSON.parse(embedDataStr);

    // Find payment by app_trans_id
    const payment = await Payment.findById(embedData.paymentId);
    if (!payment) {
      console.log("Payment not found:", embedData.paymentId);
      return res.json({ return_code: 0, return_message: "payment not found" });
    }

    // Update payment status
    payment.status = "completed";
    payment.zaloPayTransId = zp_trans_id;
    payment.paidAt = new Date();
    await payment.save();

    // Handle based on payment type
    if (payment.type === "membership" && embedData.membershipId) {
      // Activate membership
      const membership = await Membership.findById(embedData.membershipId);
      if (membership) {
        membership.status = "completed";
        membership.createdDate = new Date();
        await membership.save();

        // Update user's membership reference
        await User.findByIdAndUpdate(payment.userId, {
          membership: embedData.membershipId,
        });
      }
      console.log("Membership activated:", embedData.membershipId);
    }

    if (payment.type === "order" && embedData.orderId) {
      // Update order status
      const order = await Order.findById(embedData.orderId);
      if (order) {
        // Add order to user's orders list
        await User.findByIdAndUpdate(payment.userId, {
          $push: { orders: embedData.orderId },
        });

        // Clear cart
        if (embedData.cartId) {
          await Cart.findByIdAndUpdate(embedData.cartId, {
            items: [],
            totalCartPrice: 0,
          });
        }
      }
      console.log("Order payment completed:", embedData.orderId);
    }

    // Return success to ZaloPay
    res.json({ return_code: 1, return_message: "success" });
  } catch (error) {
    console.error("ZaloPay callback error:", error);
    res.json({ return_code: 0, return_message: "error" });
  }
});

// ============================================
// QUERY PAYMENT STATUS
// ============================================

/**
 * Query ZaloPay payment status
 * GET /payment/zalopay/status/:appTransId
 */
router.get("/zalopay/status/:appTransId", async (req: Request, res: Response) => {
  try {
    const { appTransId } = req.params;

    const postData = {
      app_id: ZALOPAY_CONFIG.app_id,
      app_trans_id: appTransId,
    };

    const data = `${postData.app_id}|${postData.app_trans_id}|${ZALOPAY_CONFIG.key1}`;
    const mac = generateZaloPayMAC(data, ZALOPAY_CONFIG.key1);

    const response = await axios.post(
      ZALOPAY_CONFIG.query_endpoint,
      { ...postData, mac },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    res.json({
      success: true,
      ...response.data,
    });
  } catch (error) {
    console.error("Query ZaloPay status error:", error);
    res.status(500).json({
      success: false,
      message: "Error querying payment status",
      error: error,
    });
  }
});

// ============================================
// VERIFY PAYMENT (for frontend after redirect)
// ============================================

/**
 * Verify payment and update status
 * GET /payment/verify/:paymentId
 */
router.get("/verify/:paymentId", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // If already completed, return success
    if (payment.status === "completed") {
      let responseData: any = {
        success: true,
        status: "completed",
        payment,
      };

      if (payment.type === "membership") {
        const membership = await Membership.findById(payment.referenceId);
        responseData.membership = membership;
      }

      if (payment.type === "order") {
        const order = await Order.findById(payment.referenceId);
        responseData.order = order;
      }

      return res.json(responseData);
    }

    // Query ZaloPay for status
    if (payment.zaloPayTransId) {
      const postData = {
        app_id: ZALOPAY_CONFIG.app_id,
        app_trans_id: payment.zaloPayTransId,
      };

      const data = `${postData.app_id}|${postData.app_trans_id}|${ZALOPAY_CONFIG.key1}`;
      const mac = generateZaloPayMAC(data, ZALOPAY_CONFIG.key1);

      try {
        const response = await axios.post(
          ZALOPAY_CONFIG.query_endpoint,
          { ...postData, mac },
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        console.log("ZaloPay query response:", response.data);

        // return_code: 1 = success, 2 = failed, 3 = pending
        if (response.data.return_code === 1) {
          // Payment successful - update status
          payment.status = "completed";
          payment.paidAt = new Date();
          await payment.save();

          let membershipData = null;
          let orderData = null;

          // Activate membership or update order
          if (payment.type === "membership") {
            const membership = await Membership.findById(payment.referenceId);
            if (membership && membership.status !== "completed") {
              membership.status = "completed";
              membership.createdDate = new Date();
              // Set expired date (30 days from now)
              membership.expiredDate = new Date(Date.now() + membership.duration * 24 * 60 * 60 * 1000);
              await membership.save();

              await User.findByIdAndUpdate(payment.userId, {
                membership: payment.referenceId,
              });
              
              membershipData = membership;
            } else if (membership) {
              membershipData = membership;
            }
          }

          if (payment.type === "order") {
            const order = await Order.findById(payment.referenceId);
            if (order) {
              orderData = order;
              // Add order to user's orders
              const user = await User.findById(payment.userId);
              const orderIdObj = order._id as any;
              if (user && !user.orders.some((id: any) => id.toString() === orderIdObj.toString())) {
                user.orders.push(orderIdObj);
                await user.save();
              }

              // Clear cart if exists in metadata
              if (payment.metadata?.cartId) {
                await Cart.findByIdAndUpdate(payment.metadata.cartId, {
                  items: [],
                  totalCartPrice: 0,
                });
              }
            }
          }

          return res.json({
            success: true,
            status: "completed",
            payment,
            membership: membershipData,
            order: orderData,
            zaloPayStatus: response.data,
          });
        } else if (response.data.return_code === 2) {
          // Payment failed
          payment.status = "failed";
          await payment.save();

          return res.json({
            success: false,
            status: "failed",
            message: response.data.return_message,
          });
        }
      } catch (queryError) {
        console.error("ZaloPay query error:", queryError);
      }
    }

    // Still pending
    res.json({
      success: true,
      status: payment.status,
      payment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error,
    });
  }
});

// ============================================
// COD (Cash on Delivery) - Shopping
// ============================================

/**
 * Create COD order
 * POST /payment/order/cod
 */
router.post("/order/cod", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { cartId, personalInfo, shippingFee = 50000 } = req.body;

    if (!cartId) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    const cart = await Cart.findById(cartId).populate("userId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const user = cart.userId as any;

    // Calculate totals
    const subtotal = cart.totalCartPrice;
    const tax = Math.round(subtotal * 0.08);
    const finalShippingFee = subtotal > 1000000 ? 0 : shippingFee;
    const totalVND = subtotal + tax + finalShippingFee;

    // Create order
    const order = new Order({
      userId: user._id,
      username: personalInfo?.fullName || `${user.firstname} ${user.lastname}`,
      email: personalInfo?.email || user.email,
      address: personalInfo?.address,
      phone: personalInfo?.phone || user.phonenumber,
      items: cart.items,
      payingMethod: "cod",
      totalCartPrice: subtotal,
      shippingFee: finalShippingFee,
      finalPrice: totalVND,
      status: "pending",
    });
    await order.save();

    // Create payment record
    const payment = new Payment({
      userId: user._id,
      type: "order",
      referenceId: order._id,
      refModel: "Order",
      amount: totalVND,
      currency: "vnd",
      paymentMethod: "cod",
      status: "pending",
      metadata: {
        customerEmail: personalInfo?.email || user.email,
        customerName: personalInfo?.fullName,
        items: cart.items,
      },
    });
    await payment.save();

    // Add order to user's orders list
    user.orders.push(order._id);
    await user.save();

    // Clear cart
    cart.items = [];
    cart.totalCartPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
      payment,
    });
  } catch (error) {
    console.error("Create COD order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error,
    });
  }
});

// ============================================
// CASH PAYMENT - Membership (pay at gym)
// ============================================

/**
 * Create Cash membership (pay at gym)
 * POST /payment/membership/cash
 */
router.post("/membership/cash", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId, planId, personalInfo } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const plan = MEMBERSHIP_PLANS[planId as keyof typeof MEMBERSHIP_PLANS];
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create pending membership
    const membership = new Membership({
      user: userId,
      username: personalInfo?.fullName || `${user.firstname} ${user.lastname}`,
      name: plan.name,
      duration: plan.duration,
      price: plan.priceVND,
      status: "pending",
    });
    await membership.save();

    // Update user's membership reference
    user.membership = membership._id;
    await user.save();

    // Create payment record
    const payment = new Payment({
      userId,
      type: "membership",
      referenceId: membership._id,
      refModel: "Membership",
      amount: plan.priceVND,
      currency: "vnd",
      paymentMethod: "cod",
      status: "pending",
      metadata: {
        planName: plan.name,
        planDuration: plan.duration,
        customerEmail: personalInfo?.email || user.email,
        customerName: personalInfo?.fullName,
      },
    });
    await payment.save();

    res.status(201).json({
      success: true,
      message: "Membership registered. Please pay at the gym to activate.",
      membership,
      payment,
    });
  } catch (error) {
    console.error("Create cash membership error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating membership",
      error: error,
    });
  }
});

// ============================================
// GET PAYMENT HISTORY
// ============================================

/**
 * Get payment history for user
 * GET /payment/history/:userId
 */
router.get("/history/:userId", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error,
    });
  }
});

/**
 * Get payment details
 * GET /payment/:paymentId
 */
router.get("/:paymentId", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error,
    });
  }
});

export default router;
