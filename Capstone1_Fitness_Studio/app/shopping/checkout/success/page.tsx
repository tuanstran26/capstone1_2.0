'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaHome, FaShoppingBag, FaBox, FaTruck, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';

export default function ShoppingCheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Get order data from localStorage
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      try {
        const order = JSON.parse(lastOrder);
        setOrderData(order);
      } catch (error) {
        console.error('Error parsing order:', error);
        router.push('/shopping');
      }
    } else {
      router.push('/shopping');
    }

    // Fire confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500 mb-6">
            <FaCheckCircle className="text-white text-6xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase, {orderData.personalInfo.fullName}!
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          {/* Order Info */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="font-bold text-lg text-accent">{orderData.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-semibold">
                  {new Date(orderData.orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-lg text-accent">
                  ${orderData.pricing.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaTruck className="text-accent" />
              Shipping Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold">{orderData.personalInfo.fullName}</p>
              <p className="text-gray-600">{orderData.personalInfo.email}</p>
              <p className="text-gray-600">{orderData.personalInfo.phone}</p>
              <p className="text-gray-600 mt-2">{orderData.personalInfo.address}</p>
              {orderData.personalInfo.city && (
                <p className="text-gray-600">
                  {orderData.personalInfo.city} {orderData.personalInfo.zipCode}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaBox className="text-accent" />
              Order Items ({orderData.items.length})
            </h3>
            <div className="space-y-4">
              {orderData.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                      <span className="font-bold text-accent">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${orderData.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {orderData.pricing.shipping === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    `$${orderData.pricing.shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${orderData.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-accent">${orderData.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h3 className="font-bold text-lg mb-6 text-center">What Happens Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <FaEnvelope className="text-blue-600 text-2xl" />
              </div>
              <h4 className="font-semibold mb-2">Confirmation Email</h4>
              <p className="text-sm text-gray-600">
                We've sent a confirmation to {orderData.personalInfo.email}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                <FaBox className="text-orange-600 text-2xl" />
              </div>
              <h4 className="font-semibold mb-2">Order Processing</h4>
              <p className="text-sm text-gray-600">
                Your order will be packed and prepared for shipping
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <FaTruck className="text-green-600 text-2xl" />
              </div>
              <h4 className="font-semibold mb-2">Fast Delivery</h4>
              <p className="text-sm text-gray-600">
                Estimated delivery in 3-5 business days
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/shopping">
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-accent hover:bg-accent-hover text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
              <FaShoppingBag />
              Continue Shopping
            </button>
          </Link>
          <Link href="/">
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 font-semibold py-4 px-8 rounded-lg hover:bg-gray-50 transition-all">
              <FaHome />
              Back to Home
            </button>
          </Link>
        </motion.div>

        {/* Auto Redirect Notice */}
        {countdown > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            Redirecting to shopping page in {countdown} seconds...
          </motion.p>
        )}
      </div>
    </div>
  );
}
