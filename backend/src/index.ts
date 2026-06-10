import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/auth";
import MongoStore from "connect-mongo";
import membershipRoutes from "./routes/membershipRouter";
import adminRoutes from "./routes/adminRouter";
import userRoutes from "./routes/userRouter";
import ptRouter from "./routes/ptRouter";
import scheduleRouter from "./routes/scheduleRouter";
import productRouter from "./routes/productRouter";
import cartRouter from "./routes/cartRouter";
import orderRouter from "./routes/orderRouter";
import aiRouter from "./routes/aiRouter";
import paymentRouter from "./routes/paymentRouter";
import notificationRouter from "./routes/notificationRouter";
import cors from "cors";
import path from "path";
import http from "http";
import { initializeSocket } from "./socket";
import { env } from "./config/env";

const app = express();

// Middleware parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Thêm CORS
app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));

// Session setup
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: MongoStore.create({
      mongoUrl: env.mongoUri,
      collectionName: "sessions",
    }),
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/mb", membershipRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/pt", ptRouter);
app.use("/schedule", scheduleRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use("/ai", aiRouter);
app.use("/payment", paymentRouter);
app.use("/notification", notificationRouter);

// Health check endpoint
app.get("/test", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Create HTTP server với Socket.io
const httpServer = http.createServer(app);
const io = initializeSocket(httpServer);

// DB connect
mongoose
  .connect(env.mongoUri)
  .then(() => {
    console.log("✅ MongoDB connected");
    httpServer.listen(env.port, () => console.log(`🚀 Server running on http://localhost:${env.port}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
