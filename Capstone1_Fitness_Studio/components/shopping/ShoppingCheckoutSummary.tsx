'use client'
import { useCart } from '@/lib/CartContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaShieldAlt, FaTruck, FaLock } from 'react-icons/fa';

const ShoppingCheckoutSummary = () => {
  const { items, getTotalPrice, getTotalItems } = useCart();
  
  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  const totalItems = getTotalItems();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg shadow-lg p-6 sticky top-6"
    >
      <h3 className="text-2xl font-bold mb-6 border-b pb-3">
        Order Summary
      </h3>

      {/* Cart Items */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">
          Items ({totalItems})
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100">
              {/* Product Image */}
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 line-clamp-2">
                  {item.name}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-sm font-semibold text-accent">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-2">
            Shipping
            {shipping === 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                FREE
              </span>
            )}
          </span>
          <span className="font-medium">
            {shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        {/* Free Shipping Progress */}
        {subtotal > 0 && subtotal < 100 && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FaTruck className="text-blue-600" />
              <p className="text-xs text-blue-700 font-medium">
                Add ${(100 - subtotal).toFixed(2)} more for FREE shipping!
              </p>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(subtotal / 100) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between items-center text-gray-600">
          <span>Tax (8%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-accent">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Security & Trust Badges */}
      <div className="space-y-4">
        {/* Secure Checkout */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <FaLock className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-900">Secure Checkout</p>
            <p className="text-xs text-green-700">Your payment info is safe with us</p>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FaShieldAlt className="text-accent flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900">30-Day Returns</p>
            <p className="text-xs text-gray-600">Easy returns and refunds</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center mb-3">We Accept:</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">VISA</span>
          </div>
          <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-orange-600">MC</span>
          </div>
          <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-blue-700">PP</span>
          </div>
          <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-blue-500">ZP</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>
          By placing an order, you agree to our{' '}
          <a href="#" className="text-accent hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-accent hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </motion.div>
  );
};

export default ShoppingCheckoutSummary;
