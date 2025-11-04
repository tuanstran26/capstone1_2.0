'use client'
import { useCart } from '@/lib/CartContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const CartSummary = () => {
  const { getTotalPrice, getTotalItems } = useCart();
  const router = useRouter();
  
  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  const totalItems = getTotalItems();

  const handleCheckout = () => {
    // Navigate to checkout page (will create later)
    router.push('/shopping/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg shadow-lg p-6 sticky top-32"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
        Order Summary
      </h2>

      {/* Item Count */}
      <div className="flex justify-between items-center mb-4 text-gray-600">
        <span>Items ({totalItems})</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between items-center mb-4 text-gray-600">
        <span className="flex items-center gap-2">
          Shipping
          {shipping === 0 && subtotal > 0 && (
            <span className="text-xs text-green-600 font-medium">FREE</span>
          )}
        </span>
        <span className="font-medium">
          {shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}
        </span>
      </div>

      {/* Free Shipping Progress */}
      {subtotal > 0 && subtotal < 100 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 mb-2">
            Add <span className="font-bold">${(100 - subtotal).toFixed(2)}</span> more for FREE shipping! 🚚
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(subtotal / 100) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tax */}
      <div className="flex justify-between items-center mb-4 text-gray-600">
        <span>Tax (8%)</span>
        <span className="font-medium">${tax.toFixed(2)}</span>
      </div>

      {/* Divider */}
      <div className="border-t my-4"></div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-accent">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={totalItems === 0}
        className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 ${
          totalItems > 0
            ? 'bg-accent text-white hover:bg-accent-hover hover:shadow-lg hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {totalItems > 0 ? 'Proceed to Checkout' : 'Cart is Empty'}
      </button>

      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
          />
        </svg>
        <span>Secure Checkout</span>
      </div>

      {/* Trust Badges */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-center gap-4 items-center opacity-60">
          <span className="text-xs text-gray-500">We Accept:</span>
          <div className="flex gap-2">
            <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
              VISA
            </div>
            <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
              MC
            </div>
            <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
              PP
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartSummary;
