'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaLock, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa'
import ZaloPayIcon from '../../components/ui/ZaloPayIcon'
import ZaloPayLoading from '../../components/ui/ZaloPayLoading'
import ClientOnly from '../../components/ClientOnly'

// Define membership plan types
const membershipPlans = [
  {
    id: 'standard',
    name: 'Standard',
    price: 500000,
    duration: '1 month',
    features: [
      'Gym access',
      'Personal locker',
      'Shower room',
      'Join 2 group classes/week',
      'Basic fitness assessment'
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 800000,
    duration: '1 month',
    features: [
      'All Standard features',
      'Unlimited group class access',
      'Personal nutrition consultation',
      '1 PT session/month',
      'Spa access',
      'Free nutritional drinks'
    ],
    popular: false,
  }
];

// Define checkout steps
enum CheckoutStep {
  SELECT_MEMBERSHIP = 0,
  PERSONAL_INFO = 1,
  PAYMENT = 2,
  SUCCESS = 3,
}

// Format price from VND to USD
const formatPrice = (price: number) => {
  // Convert VND to USD (approximate rate: 1 USD = 24,000 VND)
  const usdPrice = price / 24000
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(usdPrice)
}

// Component MembershipSelector
const MembershipSelector = ({ plans, onSelect }: { plans: any[], onSelect: (plan: any) => void }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlanId(plan.id);
    // Immediately update the selected plan when a plan is clicked
    onSelect(plan);
  };

  const handleContinue = () => {
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    if (selectedPlan) {
      onSelect(selectedPlan);
    }
  };

  return (
    <div>
     <h2 className="text-3xl font-bold mb-6 text-center">Choose a Membership Plan</h2>
<p className="text-gray-600 mb-10 text-center text-lg">
  Select the membership plan that best fits your training needs
</p>

      <div className="flex flex-col md:flex-row justify-center gap-8 mb-10">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`relative flex-1 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 cursor-pointer max-w-md ${
              selectedPlanId === plan.id
                ? 'shadow-2xl border-2 border-accent scale-105'
                : 'shadow-lg border border-gray-200 hover:shadow-xl'
            }`}
            onClick={() => handleSelectPlan(plan)}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-gray-700 to-gray-900 text-white">
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm opacity-80">Membership Plan</p>
            </div>
            
            {/* Price */}
            <div className="p-6 bg-white">
              <div className="mb-6 text-center">
                <span className="text-4xl font-bold text-gray-800">{formatPrice(plan.price)}</span>
                <span className="text-gray-500 ml-2">/{plan.duration}</span>
              </div>

              {/* Features */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <ul className="space-y-4">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center mr-3 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Select button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(plan);
                  handleContinue();
                }}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                  selectedPlanId === plan.id 
                    ? 'bg-gray-800 hover:bg-gray-900 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {selectedPlanId === plan.id ? 'Selected' : 'Choose this plan'}
              </button>
            </div>
            

          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleContinue}
          disabled={!selectedPlanId}
          className={`font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
            selectedPlanId 
              ? 'bg-accent hover:bg-accent/90 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedPlanId ? 'Continue to Payment' : 'Please select a membership plan'}
        </button>
      </div>
    </div>
  );
};

// Component PersonalInfoForm
const PersonalInfoForm = ({ initialValues, onSubmit, onBack }: any) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!values.fullName.trim()) {
      newErrors.fullName = 'Please enter full name';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim() || !emailRegex.test(values.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!values.phone.trim()) {
      newErrors.phone = 'Please enter phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(values);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      <p className="text-gray-600 mb-8">
        Please provide your personal information to complete membership registration
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300 focus:ring-accent/20'
              }`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500' : 'border-gray-300 focus:ring-accent/20'
              }`}
              placeholder="example@email.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.phone ? 'border-red-500' : 'border-gray-300 focus:ring-accent/20'
              }`}
              placeholder="0912345678"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={values.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="123 ABC Street, XYZ District, Ho Chi Minh City"
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
          
          <button
            type="submit"
            className="bg-accent hover:bg-accent/90 text-white font-medium py-3 px-8 rounded-md transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// Component PaymentForm
const PaymentForm = ({ onSubmit, onBack, isProcessing, error, paymentMethod, setPaymentMethod }: any) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment</h2>
      <p className="text-gray-600 mb-8">
        Choose your preferred payment method
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex items-center justify-center px-4 py-4 border-2 rounded-lg transition-all duration-200 ${
              paymentMethod === 'card'
                ? 'border-accent bg-accent/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <FaCreditCard className={`mr-3 text-xl ${paymentMethod === 'card' ? 'text-accent' : 'text-gray-500'}`} />
            <div className="text-left">
              <div className={`font-medium ${paymentMethod === 'card' ? 'text-accent' : 'text-gray-700'}`}>
                Credit Card
              </div>
              <div className="text-xs text-gray-500">Visa, MasterCard</div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('banking')}
            className={`flex items-center justify-center px-4 py-4 border-2 rounded-lg transition-all duration-200 ${
              paymentMethod === 'banking'
                ? 'border-accent bg-accent/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <span className={`mr-3 text-xl ${paymentMethod === 'banking' ? 'text-accent' : 'text-gray-500'}`}>🏦</span>
            <div className="text-left">
              <div className={`font-medium ${paymentMethod === 'banking' ? 'text-accent' : 'text-gray-700'}`}>
                Internet Banking
              </div>
              <div className="text-xs text-gray-500">Bank Transfer</div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`flex items-center justify-center px-4 py-4 border-2 rounded-lg transition-all duration-200 ${
              paymentMethod === 'cash'
                ? 'border-accent bg-accent/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <FaMoneyBillWave className={`mr-3 text-xl ${paymentMethod === 'cash' ? 'text-accent' : 'text-gray-500'}`} />
            <div className="text-left">
              <div className={`font-medium ${paymentMethod === 'cash' ? 'text-accent' : 'text-gray-700'}`}>
                Cash
              </div>
              <div className="text-xs text-gray-500">At gym location</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('zalopay')}
            className={`flex items-center justify-center px-4 py-4 border-2 rounded-lg transition-all duration-200 relative overflow-hidden ${
              paymentMethod === 'zalopay'
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md transform scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm hover:bg-blue-50/30'
            }`}
          >
            {/* ZaloPay Background Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 ${
              paymentMethod === 'zalopay' ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-200`} />
            
            <div className={`mr-3 text-3xl relative z-10 ${
              paymentMethod === 'zalopay' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              <ZaloPayIcon size={40} className={paymentMethod === 'zalopay' ? '' : 'grayscale'} />
            </div>
            <div className="text-left relative z-10">
              <div className={`font-bold text-lg ${
                paymentMethod === 'zalopay' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                ZaloPay
              </div>
              <div className={`text-sm flex items-center ${
                paymentMethod === 'zalopay' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                🚀 Fast & Secure
              </div>
            </div>
            
            {/* Popular badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full transform rotate-12 shadow-sm">
              HOT
            </div>
          </button>
        </div>

        {paymentMethod === 'card' && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="text-center">
              <FaCreditCard size={48} className="mx-auto mb-4 text-blue-500" />
              <h3 className="font-medium text-gray-800 mb-2">Credit/Debit Card Payment</h3>
              <p className="text-sm text-gray-600">Supports Visa, MasterCard and other popular card types</p>
            </div>
          </div>
        )}

        {paymentMethod === 'banking' && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="text-center">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="font-medium text-gray-800 mb-2">Bank Transfer</h3>
              <div className="bg-white rounded-lg p-4 mt-4 border">
                <p className="font-medium text-gray-800">Account Number:</p>
                <p className="text-lg font-bold text-blue-600 mt-1">1234567890</p>
                <p className="text-sm text-gray-600 mt-1">NGUYEN VAN A - ABC Bank</p>
                <p className="text-xs text-gray-500 mt-2">
                  Content: [Full Name] - [Phone Number]
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="text-center">
              <FaMoneyBillWave size={48} className="mx-auto mb-4 text-green-500" />
              <h3 className="font-medium text-gray-800 mb-2">Cash Payment at Gym</h3>
              <div className="bg-white rounded-lg p-4 mt-4 border">
                <p className="text-sm text-gray-600 mb-2">📍 Address: 123 ABC Street, XYZ District, Ho Chi Minh City</p>
                <p className="text-sm text-gray-600 mb-2">🕐 Operating Hours: 6:00 - 22:00 daily</p>
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-3">
                  ⚠️ Membership will be activated immediately after successful payment
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'zalopay' && (
          <div className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm">
            <div className="text-center">
              <ZaloPayIcon size={64} className="mx-auto mb-4" />
              
              <h3 className="text-lg font-bold text-blue-800 mb-2">Payment via ZaloPay</h3>
              <p className="text-blue-600 mb-4">You will be redirected to ZaloPay to complete the payment securely.</p>
              
              <div className="bg-white/70 rounded-lg p-3 mb-4 border border-blue-100">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center text-green-600">
                    <span className="mr-1">🔒</span>
                    <span className="font-medium">Secure</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <span className="mr-1">⚡</span>
                    <span className="font-medium">Instant</span>
                  </div>
                  <div className="flex items-center text-purple-600">
                    <span className="mr-1">📱</span>
                    <span className="font-medium">Convenient</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                💡 Tip: Install ZaloPay app for faster payments
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isProcessing}
          >
            Back
          </button>
          
          <button
            onClick={() => onSubmit({ paymentMethod })}
            className={`relative overflow-hidden font-medium py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[200px] ${
              paymentMethod === 'zalopay'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
                : isProcessing 
                ? 'bg-accent/70 text-white cursor-not-allowed' 
                : 'bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg'
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              paymentMethod === 'zalopay' ? (
                <ZaloPayLoading message="Redirecting..." />
              ) : (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                  Processing...
                </>
              )
            ) : (
              <>
                {paymentMethod === 'zalopay' ? (
                  <>
                    <ZaloPayIcon size={20} className="mr-2" />
                    Pay with ZaloPay
                  </>
                ) : (
                  'Complete Payment'
                )}
              </>
            )}
            
            {/* ZaloPay button effect */}
            {paymentMethod === 'zalopay' && !isProcessing && (
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component PaymentSuccess
const PaymentSuccess = ({ plan, personalInfo, onFinish }: any) => {
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(5); // 5 second countdown
  const router = useRouter();

  useEffect(() => {
    // Generate order number on client side only
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(`FIT${randomNum}`);
    setMounted(true);

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/'); // Auto redirect to homepage
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-500 text-4xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Processing...</h2>
          <p className="text-gray-600">Please wait a moment.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-500 text-4xl">✓</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600">
          Thank you for registering as a member at Fitness Studio.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
        <h3 className="text-xl font-bold mb-4">Order Information</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm">Order ID</p>
            <p className="font-medium">{orderNumber}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Membership Plan</p>
            <p className="font-medium">{plan.name}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Duration</p>
            <p className="font-medium">{plan.duration}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="font-medium text-accent">{formatPrice(plan.price)}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium mb-2">Personal Information</h4>
          <p><span className="text-gray-600">Full Name:</span> {personalInfo.fullName}</p>
          <p><span className="text-gray-600">Email:</span> {personalInfo.email}</p>
          <p><span className="text-gray-600">Phone Number:</span> {personalInfo.phone}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => router.push('/')}
          className="w-full bg-accent hover:bg-accent/90 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          Back to Home
        </button>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full border border-accent text-accent hover:bg-accent hover:text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          Go to Dashboard
        </button>
        
        {/* Auto redirect notification */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            🕐 Auto redirect to homepage in <span className="font-bold">{countdown}</span> seconds
          </p>
        </div>
      </div>
    </div>
  );
};

// Component CheckoutSummary
const CheckoutSummary = ({ plan, step }: { plan: any, step: number }) => {
  if (!plan) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6 border border-gray-100">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Order Summary
        </h3>
        
        <div className="text-center text-gray-500 py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          <p className="text-lg font-medium mb-2">No membership plan selected</p>
          <p className="text-sm">Please select a membership plan to view order summary</p>
        </div>
      </div>
    );
  }

  const totalAmount = plan.price; // No VAT

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6 border border-gray-100">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        Order Summary
      </h3>
      
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="font-medium text-gray-700">Membership Plan:</span>
          <span className="font-semibold">{plan.name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium text-gray-700">Duration:</span>
          <span>{plan.duration}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Plan Price:</span>
          <span className="text-gray-900">{formatPrice(plan.price)}</span>
        </div>
      </div>
      

      
      <div className="flex justify-between mb-6 bg-gray-50 p-3 rounded-lg">
        <span className="text-lg font-bold">Total:</span>
        <span className="text-lg font-bold text-accent">{formatPrice(totalAmount)}</span>
      </div>
      
      {/* Payment security badges */}
      <div className="flex items-center justify-center space-x-3 mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center text-gray-500 text-xs">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Secure Payment
        </div>
        <div className="flex items-center text-gray-500 text-xs">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          Information Security
        </div>
      </div>
      
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="text-center">
          By continuing, you agree to our{' '}
          <a href="#" className="text-accent hover:underline font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-accent hover:underline font-medium">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.SELECT_MEMBERSHIP);
  const [selectedPlan, setSelectedPlan] = useState<any>(null); // No default plan selected
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Get plan information from URL when page loads
  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      const plan = membershipPlans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setCurrentStep(CheckoutStep.PERSONAL_INFO); // Go directly to personal information step
      }
    }
  }, [searchParams]);

  // Handle membership plan selection
  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    nextStep();
  };

  // Handle personal information submission
  const handlePersonalInfoSubmit = (info: any) => {
    setPersonalInfo(info);
    nextStep();
  };

  // Check server connectivity
  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/test', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.log('Server check failed:', error);
      return false;
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async (paymentDetails: any) => {
    setIsProcessing(true);
    setPaymentError('');

    try {
      // Get user from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setPaymentError('Please login first.');
        return;
      }
      const user = JSON.parse(userData);

      if (paymentDetails.paymentMethod === 'zalopay') {
        // Check server connectivity first
        const serverOnline = await checkServerStatus();
        if (!serverOnline) {
          setPaymentError('Server unavailable. Please ensure server is running on port 5000.');
          return;
        }

        // Prepare payment data for ZaloPay
        const paymentData = {
          userId: user._id,
          planId: selectedPlan.id,
          personalInfo: {
            fullName: personalInfo.fullName,
            email: personalInfo.email,
            phone: personalInfo.phone,
            address: personalInfo.address,
          }
        };

        // Call backend API to get ZaloPay payment URL
        let res;
        try {
          res = await fetch('http://localhost:5000/payment/membership/zalopay', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(paymentData),
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
        } catch (fetchError: any) {
          console.error('Network error:', fetchError);
          if (fetchError.name === 'AbortError') {
            setPaymentError('Request timeout. Server took too long to respond.');
          } else {
            setPaymentError('Cannot connect to server. Please check if server is running on port 5000.');
          }
          return;
        }

        if (!res.ok) {
          let errorMessage = `Server error: ${res.status} ${res.statusText}`;
          try {
            const errorData = await res.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // Keep default error message
          }
          setPaymentError(errorMessage);
          return;
        }
        
        let data;
        try {
          data = await res.json();
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          setPaymentError('Data format error from server.');
          return;
        }
        
        if (data.success && data.order_url) {
          // Store payment info in localStorage for success page
          localStorage.setItem('pendingPayment', JSON.stringify({
            paymentId: data.paymentId,
            membershipId: data.membershipId,
            plan: selectedPlan,
            personalInfo: personalInfo
          }));
          
          // Redirect to ZaloPay page
          window.location.href = data.order_url;
          return;
        } else {
          setPaymentError(data.message || 'Unable to get ZaloPay payment link.');
        }
      } else if (paymentDetails.paymentMethod === 'cash') {
        // Cash payment at gym
        const paymentData = {
          userId: user._id,
          planId: selectedPlan.id,
          personalInfo: {
            fullName: personalInfo.fullName,
            email: personalInfo.email,
            phone: personalInfo.phone,
            address: personalInfo.address,
          }
        };

        const res = await fetch('http://localhost:5000/payment/membership/cash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(paymentData),
        });

        const data = await res.json();
        if (data.success) {
          localStorage.setItem('pendingPayment', JSON.stringify({
            paymentId: data.payment._id,
            membershipId: data.membership._id,
            plan: selectedPlan,
            personalInfo: personalInfo,
            paymentMethod: 'cash'
          }));
          nextStep();
        } else {
          setPaymentError(data.message || 'Error creating membership.');
        }
      } else {
        // Simulate payment API call for other methods (card, banking)
        await new Promise(resolve => setTimeout(resolve, 2000));
        nextStep();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An error occurred during payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Move to next step
  const nextStep = () => {
    setCurrentStep(prev => prev + 1 as CheckoutStep);
  };

  // Go back to previous step
  const prevStep = () => {
    setCurrentStep(prev => prev - 1 as CheckoutStep);
  };

  // Handle when payment is completed
  const handleFinish = () => {
    router.push('/'); // Redirect to homepage
  };

  // Display content based on current step
  const renderStep = () => {
    switch (currentStep) {
      case CheckoutStep.SELECT_MEMBERSHIP:
        return (
          <MembershipSelector 
            plans={membershipPlans} 
            onSelect={handleSelectPlan} 
          />
        );
      case CheckoutStep.PERSONAL_INFO:
        return (
          <PersonalInfoForm 
            initialValues={personalInfo} 
            onSubmit={handlePersonalInfoSubmit} 
            onBack={prevStep} 
          />
        );
      case CheckoutStep.PAYMENT:
        return (
          <PaymentForm 
            onSubmit={handlePaymentSubmit} 
            onBack={prevStep} 
            isProcessing={isProcessing} 
            error={paymentError}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        );
      case CheckoutStep.SUCCESS:
        return (
          <PaymentSuccess 
            plan={selectedPlan} 
            personalInfo={personalInfo} 
            onFinish={handleFinish} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Membership Payment</h1>
        
        {/* Display payment steps */}
        {currentStep !== CheckoutStep.SUCCESS && (
          <div className="mb-8">
            <div className="flex justify-center items-center mb-8">
              {[
                { icon: <FaMoneyBillWave />, text: 'Select Plan' },
                { icon: <FaLock />, text: 'Personal Info' },
                { icon: <FaCreditCard />, text: 'Payment' },
              ].map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index <= currentStep ? 'bg-accent text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`ml-2 text-sm ${
                    index <= currentStep ? 'text-accent font-medium' : 'text-gray-500'
                  }`}>
                    {step.text}
                  </span>
                  {index < 2 && (
                    <div className={`w-12 h-1 mx-2 ${
                      index < currentStep ? 'bg-accent' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-md p-6">
              {renderStep()}
            </div>
          </div>

          {/* Order summary */}
          {currentStep !== CheckoutStep.SUCCESS && (
            <div className="lg:w-1/3">
              <CheckoutSummary 
                plan={selectedPlan} 
                step={currentStep}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 