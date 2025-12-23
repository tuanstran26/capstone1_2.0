'use client'
import Image from 'next/image';
import { useCart, CartItem as CartItemType } from '@/lib/CartContext';
import { Product } from './ProductCard';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useEffect, useState } from 'react';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  console.log("CartItem received item:", item);
  const { addItem, removeItem } = useCart();

  const [tempQuantity, setTempQuantity] = useState(item.quantity);




  const handleIncrement = async () => {
    addItem(1);
    setTempQuantity(tempQuantity + 1);
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
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: 1,
      })
    });
  }
  const handleDecrement = async () => {

    if (item.quantity > 1) {
      removeItem(1);
      setTempQuantity(tempQuantity - 1);
    }
    const userData = localStorage.getItem("user");
    const parsedUser = userData ? JSON.parse(userData) : null;
    const cartId = parsedUser?.cartId;
    const res = await fetch(`http://localhost:5000/cart/remove/${cartId}/items/${item.productId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });
    if (tempQuantity == 0)
      return null;
  };

  const handleRemove = async () => {
    const userData = localStorage.getItem("user");
    const parsedUser = userData ? JSON.parse(userData) : null;
    const cartId = parsedUser?.cartId;
    const res = await fetch(`http://localhost:5000/cart/remove/${cartId}/items/${item.productId}?qty=${item.quantity}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });
    removeItem(tempQuantity);
    setTempQuantity(0);
    return null;
  };

  const subtotal = item.price * item.quantity;

  useEffect(() => {
    console.log("CartItem quantity updated:", item.quantity);
    if (item.quantity == 0) {
      return;
    }
  }, [item.quantity]);

  return (
    <motion.div
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
          <Image
            src={item.url}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Top Section: Name, Category, Price */}
          <div>
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                  {item.name}
                </h3>

              </div>
              <button
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 transition-colors ml-2"
                aria-label="Remove item"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Bottom Section: Price, Quantity Controls */}
          <div className="flex justify-between items-center mt-3">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              {tempQuantity > 1 ? (
                // Khi quantity > 1 → giảm bình thường
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-4 h-4 text-gray-700" />
                </button>
              ) : (
                <button
                  onClick={handleRemove} // bạn tự đổi hàm ở đây
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="Remove item"
                >
                  <FiMinus className="w-4 h-4 text-gray-700" />
                </button>
              )}
              <span className="font-semibold text-gray-900 w-8 text-center">
                {tempQuantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-8 h-8 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Price Section */}
            <div className="text-right">
              <div className="text-sm text-gray-500">
                ${item.price.toFixed(2)} each
              </div>
              <div className="text-xl font-bold text-accent">
                ${subtotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
