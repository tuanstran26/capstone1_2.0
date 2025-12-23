'use client'
import Image from 'next/image';
// import { useCart, CartItem as CartItemType } from '@/lib/CartContext';
// import { Product } from './ProductCard';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { useRouter } from "next/navigation";
import CartSummary from '@/components/shopping/CartSummary';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const router = useRouter();


  interface ICartResponse {
    _id: string;
    userId: string | null;
    username: string | null;
    address: string | null;
    items: {
      productId: string;
      name: string;
      url: string;
      quantity: number;
      price: number;
      totalPrice: number;
    }[];
    payingMethod: "cod" | "credit" | null;
    totalCartPrice: number;
    createdAt: string;
    updatedAt: string;
  }

  const { totalItems } = useCart();
  const [items, setItems] = useState<ICartResponse["items"]>([]);
  const [loading, setLoading] = useState(true);
  const [cartInfo, setCartInfo] = useState<ICartResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { addItem, removeItem } = useCart();
  const [tempQuantities, setTempQuantities] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    totalItems: 0,
  });


  useEffect(() => {
    const initial: Record<string, number> = {};
    items.forEach((item: any) => {
      initial[item.productId] = item.quantity;
    });
    setTempQuantities(initial);
  }, [items]);


  // const calculateSummary = (updatedQuantities: any) => {
  //   const subtotal = items.reduce((acc: number, item: any) => {
  //     const q = updatedQuantities[item.productId] ?? item.quantity;
  //     return acc + q * item.price;
  //   }, 0);

  //   const totalItems = items.reduce((acc: number, item: any) => {
  //     const q = updatedQuantities[item.productId] ?? item.quantity;
  //     return acc + q;
  //   }, 0);

  //   const shipping = subtotal > 100 ? 0 : 10;
  //   const tax = subtotal * 0.08;
  //   const total = subtotal + shipping + tax;

  //   setSummary({ subtotal, totalItems, tax, shipping, total });
  // };

  const calculateSummary = (items: any[]) => {
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return { subtotal, totalItems, shipping, tax, total };
  };

  const incrementTemp = (id: string) => {
    setTempQuantities(prev => {
      const updated = {
        ...prev,
        [id]: (prev[id] ??
          items.find((i: any) => i.productId === id)?.quantity) + 1
      };

      // 👉 Tạo ra danh sách items mới với quantity đã cập nhật
      const updatedItems = items.map((item: any) => ({
        ...item,
        quantity: updated[item.productId] ?? item.quantity
      }));

      // 👉 Cập nhật summary
      setSummary(calculateSummary(updatedItems));

      return updated;
    });
  };


  const decrementTemp = (id: string) => {
    setTempQuantities(prev => {
      const current =
        prev[id] ??
        items.find((i: any) => i.productId === id)?.quantity;

      const updated = {
        ...prev,
        [id]: Math.max(1, current - 1)
      };

      // 👉 Tạo ra danh sách items mới với quantity đã cập nhật
      const updatedItems = items.map((item: any) => ({
        ...item,
        quantity: updated[item.productId] ?? item.quantity
      }));

      // 👉 Cập nhật summary
      setSummary(calculateSummary(updatedItems));

      return updated;
    });
  };


  {
    items.map(item => {
      const q = tempQuantities[item.productId] ?? item.quantity;
      const subtotal = item.price * q;

      return (
        <motion.div key={item.productId}>
          <button
            onClick={() => {
              decrementTemp(item.productId);
              handleDecrement(item.productId, item.name, item.price, q);
            }}
          >
            -
          </button>

          <span>{q}</span>

          <button
            onClick={() => {
              incrementTemp(item.productId);
              handleIncrement(item.productId, item.name, item.price);
            }}
          >
            +
          </button>

          <div>${subtotal.toFixed(2)}</div>
        </motion.div>
      );
    })
  }


  // const fetchCartData = async (cartId: string) => {
  //   try {
  //     const res = await fetch(`http://localhost:5000/cart/get/${cartId}`);
  //     const data = await res.json();

  //     setCartInfo(data);
  //     setItems(data.items || []);
  //   } catch (error) {
  //     console.error("Error fetching cart:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchCartData = async (cartId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/cart/get/${cartId}`);
      const data = await res.json();

      setCartInfo(data);
      setItems(data.items || []);

      // 👉 cập nhật summary ngay khi fetch API thành công
      const newSummary = calculateSummary(data.items || []);
      setSummary(newSummary);

    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };


  // Lấy cart lần đầu
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const user = JSON.parse(stored);
    if (!user.cartId) return;

    fetchCartData(user.cartId);
  }, []);

  // Khi items thay đổi → nếu rỗng thì fetch lại
  useEffect(() => {
    console.log("CartPage detected totalItems change:");
    if (loading) return;
    // nếu items rỗng nhưng totalItems > 0 -> có khả năng backend cập nhật chậm, refetch
    // hoặc đơn giản refetch mỗi khi totalItems thay đổi
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const user = JSON.parse(stored);
    if (!user.cartId) return;

    console.log("totalItems changed -> fetch cart", totalItems);
    if (totalItems === 0) {
      fetchCartData(user.cartId);
    }
  }, [totalItems]); // <-- trigger khi add/remove gọi addItem/removeItem


  const clearCart = async () => {
    console.log("Clearing cart...");
  };

  // Gọi API lấy cart

  if (notFound) {
    return (

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-6">
          <FiShoppingBag className="w-16 h-16 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
        </p>
        <Link href="/shopping">
          <button className="bg-accent text-white px-8 py-4 rounded-full font-semibold hover:bg-accent-hover transition-all duration-300 hover:scale-105 shadow-lg">
            Start Shopping
          </button>
        </Link>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg font-medium">Loading cart...</p>
      </div>
    );
  }

  if (!cartInfo) return <div className="text-center py-20">
    <p className="text-gray-600 text-lg font-medium">Loading cart...</p>
  </div>;



  const handleIncrement = async (productID: string, productName: string, productPrice: number) => {
    addItem(1);
    const userData = localStorage.getItem("user");
    const parsedUser = userData ? JSON.parse(userData) : null;
    const cartId = parsedUser?.cartId;
    const res = await fetch(`http://localhost:5000/cart/add/${cartId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productID,
        name: productName,
        price: productPrice,
        quantity: 1,
      })
    });
  }
  const handleDecrement = async (productID: string, productName: string, productPrice: number, quantity: number) => {

    const userData = localStorage.getItem("user");
    const parsedUser = userData ? JSON.parse(userData) : null;
    const cartId = parsedUser?.cartId;

    // Gọi API
    await fetch(`http://localhost:5000/cart/remove/${cartId}/items/${productID}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });

    // Cập nhật global count
    removeItem(1);

    // ***********************
    // UPDATE UI NGAY LẬP TỨC
    // ***********************
    setItems(prev =>
      quantity > 1
        ? prev.map(p =>
          p.productId === productID
            ? { ...p, quantity: p.quantity - 1, totalPrice: (p.quantity - 1) * p.price }
            : p
        )
        : prev.filter(p => p.productId !== productID)   // xoá khỏi UI nếu còn 1
    );
  };

  const handleRemove = async (productID: string, productName: string, productPrice: number, quantity: number) => {
    const userData = localStorage.getItem("user");
    const parsedUser = userData ? JSON.parse(userData) : null;
    const cartId = parsedUser?.cartId;
    const res = await fetch(`http://localhost:5000/cart/remove/${cartId}/items/${productID}?qty=${quantity}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });
    removeItem(quantity);

  };

  const handleCheckout = () => {
    console.log("Proceeding to checkout...");
    router.push("/shopping/checkout");

  }


  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="mb-8">
        <Link
          href="/shopping"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-accent transition-colors mb-4"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Continue Shopping</span>
        </Link>

        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Shopping Cart
            {items.length > 0 && (
              <span className="text-accent ml-3">({items.length})</span>
            )}
          </h1>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {items.length === 0 ? (
        // Empty Cart State
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-6">
            <FiShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Link href="/shopping">
            <button className="bg-accent text-white px-8 py-4 rounded-full font-semibold hover:bg-accent-hover transition-all duration-300 hover:scale-105 shadow-lg">
              Start Shopping
            </button>
          </Link>
        </motion.div>
      ) : (
        // Cart with Items
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              <div className="space-y-4">
                {items.map((item: any) => {
                  const q = tempQuantities[item.productId] ?? item.quantity;
                  const subtotal = item.price * q;

                  return (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex gap-4">

                        {/* Product Image */}
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <Image src={item.url} alt={item.name} fill className="object-cover" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">

                          {/* Top: Name + Remove */}
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                                  {item.name}
                                </h3>
                              </div>

                              <button
                                onClick={() => { handleRemove(item.productId, item.name, item.price, item.quantity) }}
                                className="text-red-500 hover:text-red-700 transition-colors ml-2"
                                aria-label="Remove item"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom: Quantity + Price */}
                          <div className="flex justify-between items-center mt-3">

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">

                              {/* {tempQuantity > 1 ? (
                                <button
                                  onClick={() => { handleDecrement(item.productId, item.name, item.price, item.quantity); decrementTempQuantity(); }}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <FiMinus className="w-4 h-4 text-gray-700" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRemove(item.productId, item.name, item.price, item.quantity)}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                  aria-label="Remove item"
                                >
                                  <FiMinus className="w-4 h-4 text-gray-700" />
                                </button>
                              )} */}
                              <button
                                onClick={() => { handleDecrement(item.productId, item.name, item.price, item.quantity); decrementTemp(item.productId) }}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <FiMinus className="w-4 h-4 text-gray-700" />
                              </button>
                              <span className="font-semibold text-gray-900 w-8 text-center">
                                {q}
                              </span>

                              <button
                                onClick={() => { handleIncrement(item.productId, item.name, item.price); incrementTemp(item.productId) }}
                                className="w-8 h-8 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
                                aria-label="Increase quantity"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                              <div className="text-xl font-bold text-accent">${subtotal.toFixed(2)}</div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

              </div>
            </AnimatePresence>

            <div className="mt-6 lg:hidden">
              <Link href="/shopping">
                <button className="w-full py-3 border-2 border-accent text-accent rounded-full font-semibold hover:bg-accent hover:text-white transition-all duration-300">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          {/* <div className="lg:col-span-1">
            <CartSummary subtotal={cartInfo.totalCartPrice || 0} />
          </div> */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 sticky top-32"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
                Order Summary
              </h2>

              {/* 👉 Summary lấy từ state summary */}
              <div className="flex justify-between items-center mb-4 text-gray-600">
                <span>Items ({summary.totalItems})</span>
                <span className="font-medium">${summary.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center mb-4 text-gray-600">
                <span className="flex items-center gap-2">
                  Shipping
                  {summary.shipping === 0 && summary.subtotal > 0 && (
                    <span className="text-xs text-green-600 font-medium">FREE</span>
                  )}
                </span>
                <span className="font-medium">
                  {summary.shipping === 0
                    ? "$0.00"
                    : `$${summary.shipping.toFixed(2)}`}
                </span>
              </div>

              {summary.subtotal > 0 && summary.subtotal < 100 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">
                    Add{" "}
                    <span className="font-bold">
                      ${(100 - summary.subtotal).toFixed(2)}
                    </span>{" "}
                    more for FREE shipping! 🚚
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(summary.subtotal / 100) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4 text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-medium">${summary.tax.toFixed(2)}</span>
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-accent">
                  ${summary.total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={summary.totalItems === 0}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 ${summary.totalItems > 0
                  ? "bg-accent text-white hover:bg-accent-hover hover:shadow-lg hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {summary.totalItems > 0 ? "Proceed to Checkout" : "Cart is Empty"}
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Additional Info Section */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Feature 1 */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" className="w-6 h-6 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Free Delivery</h3>
              <p className="text-sm text-gray-600">On orders over $100</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" className="w-6 h-6 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Secure Payment</h3>
              <p className="text-sm text-gray-600">100% secure transactions</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" className="w-6 h-6 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0
                       3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1
                       13.803-3.7l3.181 3.182m0-4.991v4.99"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Easy Returns</h3>
              <p className="text-sm text-gray-600">30-day return policy</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
