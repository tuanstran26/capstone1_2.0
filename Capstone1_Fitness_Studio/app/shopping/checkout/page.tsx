'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import ShoppingCheckoutSummary from '@/components/shopping/ShoppingCheckoutSummary';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaUser, FaCreditCard, FaCheck, FaShoppingBag } from 'react-icons/fa';
import Link from 'next/link';

// Checkout Steps
enum CheckoutStep {
  PERSONAL_INFO = 0,
  PAYMENT = 1,
}

export default function ShoppingCheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(CheckoutStep.PERSONAL_INFO);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  // Calculate totals
  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/shopping');
    }
  }, [items, router]);

  // Handle personal info submit
  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phone || !personalInfo.address) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setCurrentStep(CheckoutStep.PAYMENT);
  };

  // Handle order submission
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Create order object
      const orderData = {
        orderId: 'ORD-' + Date.now(),
        items: items,
        personalInfo: personalInfo,
        paymentMethod: paymentMethod,
        pricing: {
          subtotal: subtotal,
          shipping: shipping,
          tax: tax,
          total: total,
        },
        orderDate: new Date().toISOString(),
        status: 'pending',
      };

      // Save order to localStorage
      localStorage.setItem('lastOrder', JSON.stringify(orderData));

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart
      clearCart();

      // Navigate to success page
      router.push(`/shopping/checkout/success?orderId=${orderData.orderId}`);
    } catch (err) {
      setError('Failed to process order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/shopping/cart"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-accent transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Cart</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {/* Step 1: Personal Info */}
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= CheckoutStep.PERSONAL_INFO
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > CheckoutStep.PERSONAL_INFO ? <FaCheck /> : <FaUser />}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Personal Info</span>
            </div>

            {/* Divider */}
            <div className={`w-16 h-1 ${currentStep >= CheckoutStep.PAYMENT ? 'bg-accent' : 'bg-gray-200'}`} />

            {/* Step 2: Payment */}
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= CheckoutStep.PAYMENT
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <FaCreditCard />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === CheckoutStep.PERSONAL_INFO && (
                <motion.div
                  key="personal-info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-lg shadow-md p-8"
                >
                  <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                  <p className="text-gray-600 mb-6">
                    Please provide your contact and shipping information
                  </p>

                  <form onSubmit={handlePersonalInfoSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={personalInfo.fullName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                          placeholder="john@example.com"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shipping Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={personalInfo.address}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                          placeholder="123 Main Street, Apt 4B"
                          required
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={personalInfo.city}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                          placeholder="New York"
                        />
                      </div>

                      {/* Zip Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          value={personalInfo.zipCode}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, zipCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-8 w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      Continue to Payment
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === CheckoutStep.PAYMENT && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-lg shadow-md p-8"
                >
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  <p className="text-gray-600 mb-6">
                    Choose your preferred payment method
                  </p>

                  {/* Payment Methods */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Credit Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        paymentMethod === 'card'
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaCreditCard className={`text-3xl mb-2 mx-auto ${paymentMethod === 'card' ? 'text-accent' : 'text-gray-400'}`} />
                      <p className="font-medium">Credit Card</p>
                      <p className="text-xs text-gray-500">Visa, MasterCard</p>
                    </button>

                    {/* Cash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-3xl mb-2 block ${paymentMethod === 'cash' ? 'text-accent' : 'text-gray-400'}`}>💵</span>
                      <p className="font-medium">Cash</p>
                      <p className="text-xs text-gray-500">On Delivery</p>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(CheckoutStep.PERSONAL_INFO)}
                      className="flex-1 border-2 border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-lg hover:bg-gray-50 transition-all"
                      disabled={isProcessing}
                    >
                      Back
                    </button>
                    
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <ShoppingCheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
