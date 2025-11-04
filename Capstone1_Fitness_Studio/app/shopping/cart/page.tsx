'use client'
import { useCart } from '@/lib/CartContext';
import CartItem from '@/components/shopping/CartItem';
import CartSummary from '@/components/shopping/CartSummary';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const { items, clearCart } = useCart();

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
          {/* Cart Items - Left Side (2 columns) */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </AnimatePresence>

            {/* Continue Shopping Button (Mobile) */}
            <div className="mt-6 lg:hidden">
              <Link href="/shopping">
                <button className="w-full py-3 border-2 border-accent text-accent rounded-full font-semibold hover:bg-accent hover:text-white transition-all duration-300">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>

          {/* Order Summary - Right Side (1 column) */}
          <div className="lg:col-span-1">
            <CartSummary />
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
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
