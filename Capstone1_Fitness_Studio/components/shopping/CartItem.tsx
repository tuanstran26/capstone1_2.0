'use client'
import Image from 'next/image';
import { useCart, CartItem as CartItemType } from '@/lib/CartContext';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const subtotal = item.price * item.quantity;

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
            src={item.image}
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
                <p className="text-xs text-accent uppercase tracking-wide">
                  {item.category}
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 transition-colors ml-2"
                aria-label="Remove item"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Bottom Section: Price, Quantity Controls */}
          <div className="flex justify-between items-center mt-3">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                <FiMinus className="w-4 h-4 text-gray-700" />
              </button>
              <span className="font-semibold text-gray-900 w-8 text-center">
                {item.quantity}
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
