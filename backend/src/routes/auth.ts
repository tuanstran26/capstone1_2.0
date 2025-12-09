import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import passport from "../config/passport";
import User, { IUser } from "../models/User"; // mình giả định bạn có IUser interface
import Cart from "../models/Cart";
import { isAdmin } from "../middlewares/authMiddleware";

const router = Router();

// // Register user
// router.post("/register", async (req: Request, res: Response) => {
//   try {
//     const { firstname, lastname, email, password, phonenumber, dob, gender, role } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "Email already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       firstname,
//       lastname,
//       email,
//       phonenumber,
//       dob,
//       gender,
//       role: role || "user", // mặc định là user
//       password: hashedPassword,
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error registering user", error: err });
//   }
// });


router.post("/register", async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password, phonenumber, dob, gender, role } = req.body;

    // 1. Check email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo user trước (chưa có cartId)
    const newUser = new User({
      firstname,
      lastname,
      email,
      phonenumber,
      dob,
      gender,
      role: role || "user",
      password: hashedPassword,
      cartId: null,
      orders: []
    });

    await newUser.save();

    // 4. Tạo Cart gán vào user mới tạo
    const newCart = await Cart.create({
      userId: newUser._id,
      username: `${firstname} ${lastname}`,
      address: newUser.address || null,
      items: [],
      payingMethod: null,
      totalCartPrice: 0
    });

    // 5. Cập nhật user.cartId
    newUser.cartId = newCart._id as any;
    await newUser.save();

    // 6. Phản hồi
    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      cart: newCart
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user", error: err });
  }
});



// Login user
router.post(
  "/login",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (err: Error | null, user: IUser | false, info: { message?: string } | undefined) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info?.message || "Login failed" });

        req.logIn(user, (loginErr: any) => {
          if (loginErr) return next(loginErr);
          return res.json({ message: "Login successful", user });
        });
      }
    )(req, res, next);
  }
);

// Logout
router.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ message: "Logged out successfully" });
  });
});

// Protected route example
router.get("/profile", (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ user: req.user });
});

// Create PT user (admin only)
router.post("/create-pt", isAdmin, async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password, phonenumber, dob, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPT = new User({
      firstname,
      lastname,
      email,
      phonenumber,
      dob,
      gender,
      role: "pt", // ép cứng role là PT
      password: hashedPassword,
    });

    await newPT.save();

    res.status(201).json({ message: "PT user created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating PT user", error: err });
  }
});


// Lấy toàn bộ PT users
router.get("/pts", async (req: Request, res: Response) => {
  try {
    const pts = await User.find({ role: "pt" }).select("-password");

    res.json(pts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching PT users", error: err });
  }
});



export default router;
