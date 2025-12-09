import Cart from "../models/Cart";
import Order from "../models/Order";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { Router, Request, Response, NextFunction } from "express";
const router = Router();


// Tìm kiếm PT theo tên
// POST /cart/:cartId/add
router.post("/add/:cartId", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const { cartId } = req.params;
        const { productId, name, price, quantity } = req.body;

        if (!productId || !name || !price || !quantity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1. Lấy cart theo ID
        const cart = await Cart.findById(cartId);
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        // 2. Kiểm tra xem product đã có trong cart chưa
        const existingItem = cart.items.find(
            (item: any) => item.productId.toString() === productId
        );

        if (existingItem) {
            // Nếu có → tăng số lượng
            existingItem.quantity += quantity;
            existingItem.totalPrice = existingItem.quantity * existingItem.price;
        } else {
            // Nếu chưa có → thêm item mới
            cart.items.push({
                productId,
                name,
                quantity,
                price,
                totalPrice: price * quantity,
            });
        }

        // 3. Cập nhật tổng tiền giỏ hàng
        cart.totalCartPrice = cart.items.reduce(
            (sum: number, item: any) => sum + item.totalPrice,
            0
        );

        // 4. Lưu lại
        await cart.save();

        res.status(200).json({
            message: "Item added to cart",
            cart,
        });

    } catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ message: "Error adding to cart", error: err });
    }
});


// DELETE /cart/:cartId/items/:productId
router.delete("/remove/:cartId/items/:productId", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const { cartId, productId } = req.params;

        const cart = await Cart.findById(cartId);
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        // Tìm item trong giỏ
        const item = cart.items.find(
            (it) => it.productId.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Nếu quantity > 1 → giảm 1
        if (item.quantity > 1) {
            item.quantity -= 1;
            item.totalPrice = item.quantity * item.price;
        } else {
            // Nếu quantity = 1 → xóa item khỏi giỏ
            cart.items = cart.items.filter(
                (it) => it.productId.toString() !== productId
            );
        }

        // Cập nhật tổng tiền của cart
        cart.totalCartPrice = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);

        await cart.save();

        return res.json({
            message: "Item updated successfully",
            cart
        });

    } catch (err) {
        return res.status(500).json({ message: "Error updating cart", error: err });
    }
});


// POST tạo order từ cart
router.post("/create-order-from-cart", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const { cartId, address, payingMethod, shippingFee } = req.body;

        if (!cartId || !address || !payingMethod) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Lấy giỏ hàng
        const cart = await Cart.findById(cartId).populate("userId");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Lấy thông tin user
        const user = cart.userId as any;
        if (!user) {
            return res.status(404).json({ message: "User not found for this cart" });
        }

        const username = `${user.firstname} ${user.lastname}`;

        // Shipping fee mặc định
        const finalShippingFee = shippingFee || 30000;

        // Tổng tiền cuối = tiền cart + ship
        const finalPrice = cart.totalCartPrice + finalShippingFee;

        // Tạo order mới
        const newOrder = new Order({
            userId: user._id,
            username,
            address,
            items: cart.items,
            payingMethod,
            totalCartPrice: cart.totalCartPrice,
            shippingFee: finalShippingFee,
            finalPrice,
            status: "pending",
        });

        await newOrder.save();

        // Cập nhật list orders trong User
        user.orders.push(newOrder._id);
        await user.save();

        // Reset giỏ hàng
        cart.items = [];
        cart.totalCartPrice = 0;
        await cart.save();

        return res.status(201).json({
            message: "Order created successfully",
            order: newOrder,
        });

    } catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ message: "Error creating order", error: err });
    }
});


export default router;