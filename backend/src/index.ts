import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
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
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Thêm CORS
app.use(cors({
  origin: "http://localhost:3000",   // FE chạy ở port 3000
  credentials: true                  // Cho phép gửi cookie đi kèm
}));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,   // set true khi deploy https
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
        || "mongodb+srv://haihuynhcit20:Xrikkk6xgRLcf3MS@fitnessstudio.qibuuw7.mongodb.net/",
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

// DB connect
mongoose
  .connect(process.env.MONGO_URI
    || "mongodb+srv://haihuynhcit20:Xrikkk6xgRLcf3MS@fitnessstudio.qibuuw7.mongodb.net/")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
