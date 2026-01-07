'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaUser, FaCreditCard, FaCheck, FaShoppingBag, FaLock, FaShieldAlt, FaTruck } from 'react-icons/fa';
import Link from 'next/link';

// Checkout Steps

type CheckoutForm = {
    fullName: string;
    email: string;
    phonenumber: string;
    address: string;
};


enum CheckoutStep {
    PERSONAL_INFO = 0,
    PAYMENT = 1,
}


export default function ShoppingCheckoutPage() {

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

    type UserLocal = {
        firstname?: string;
        lastname?: string;
        email?: string;
        phonenumber?: string;
        address?: string | null;
    };


    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(CheckoutStep.PERSONAL_INFO);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'cod' | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<ICartResponse["items"]>([]);
    const [cartInfo, setCartInfo] = useState<ICartResponse | null>(null);
    const [user, setUser] = useState<UserLocal | null>(null);
    const [city, setCity] = useState<string>('');
    const [zipCode, setZipCode] = useState<string>('');
    const [shipping, setShipping] = useState<number>(0);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [form, setForm] = useState<CheckoutForm>({
        fullName: "",
        email: "",
        phonenumber: "",
        address: ""
    });


    const calculateSummary = (items: any[]) => {

        const subtotal = items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

        const shipping = subtotal > 1000000 ? 0 : 50000;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        return { subtotal, totalItems, shipping, tax, total };
    };


    const handleCreateOrder = async () => {
        try {
            const userData = localStorage.getItem("user");
            if (!userData) {
                throw new Error("User not logged in");
            }

            const parsedUser = JSON.parse(userData);
            const cartId = parsedUser.cartId;
            const res = await fetch("http://localhost:5000/cart/create-order-from-cart", {
                method: "POST",
                credentials: "include", // ⚠️ BẮT BUỘC cho ensureAuthenticated
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cartId,
                    fullname: form.fullName,
                    email: form.email,
                    address: form.address,
                    phone: form.phonenumber,
                    payingMethod: paymentMethod,
                    shippingFee: shipping,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Create order failed");
            }

            console.log("Order created:", data.order);

            // 👉 redirect sang trang success / payment
            router.push(`/shopping/checkout/success?orderId=${data.order._id}`);

        } catch (error: any) {
            console.error("Create order error:", error);
            alert(error.message || "Something went wrong");
        }
    };



    const fetchCartData = async (cartId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/cart/get/${cartId}`);
            const data = await res.json();

            setCartInfo(data);
            setItems(data.items || []);
            const newSummary = calculateSummary(data.items || []);
            setShipping(newSummary.shipping);
            setSubtotal(newSummary.subtotal);
            setTotalItems(newSummary.totalItems);
            setTax(newSummary.tax);
            setTotal(newSummary.total);

            // 👉 cập nhật summary ngay khi fetch API thành công

            console.log("Fetched cart data:", data);
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
        setUser(user);
        fetchCartData(user.cartId);

        setForm((prev) => ({
            ...prev,
            email: user?.email ?? "",
            phonenumber: user?.phonenumber ?? "",
        }));
    }, []);

    const handlePersonalInfoSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault(); // ⬅️ CỰC KỲ QUAN TRỌNG

        setCurrentStep(CheckoutStep.PAYMENT);
        console.log("Personal info submitted");
    };


    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            fullName: cartInfo?.username ?? ""

        }));
    }, [cartInfo]);


    useEffect(() => {
        console.log("form updated:", form);
    }, [form]);




    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    useEffect(() => {
        console.log("Payment method selected:", paymentMethod);
    }, [paymentMethod]);

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
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= CheckoutStep.PERSONAL_INFO
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
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= CheckoutStep.PAYMENT
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
                                                    name="fullName"

                                                    value={form.fullName}
                                                    onChange={handleChange}
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
                                                    name="email"
                                                    value={form.email}
                                                    onChange={handleChange}
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
                                                    name="phonenumber"
                                                    value={form.phonenumber}
                                                    onChange={handleChange}
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
                                                    name="address"
                                                    value={form.address}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                                                    placeholder="123 Main Street, Apt 4B"
                                                    required
                                                />
                                            </div>

                                            {/* City */}
                                            {/* <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={""}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                                                    placeholder="New York"
                                                />
                                            </div> */}

                                            {/* Zip Code */}
                                            {/* <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Zip Code
                                                </label>
                                                <input
                                                    type="text"
                                                    name="zipCode"
                                                    value={""}
                                                    onChange={(e) => setZipCode(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                                                    placeholder="10001"
                                                />
                                            </div> */}
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
                                            onClick={() => setPaymentMethod('credit')}
                                            className={`p-6 border-2 rounded-lg transition-all ${paymentMethod === 'credit'
                                                ? 'border-accent bg-accent/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <FaCreditCard className={`text-3xl mb-2 mx-auto ${paymentMethod === 'credit' ? 'text-accent' : 'text-gray-400'}`} />
                                            <p className="font-medium">Credit Card</p>
                                            <p className="text-xs text-gray-500">Visa, MasterCard</p>
                                        </button>

                                        {/* Cash */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('cod')}
                                            className={`p-6 border-2 rounded-lg transition-all ${paymentMethod === 'cod'
                                                ? 'border-accent bg-accent/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className={`text-3xl mb-2 block ${paymentMethod === 'cod' ? 'text-accent' : 'text-gray-400'}`}>💵</span>
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
                                            onClick={handleCreateOrder}
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
                                        <div
                                            key={item.productId}
                                            className="flex gap-3 pb-3 border-b border-gray-100"
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                <Image
                                                    src={item.url}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
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
                                                        ${item.totalPrice}
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
                                    <span className="font-medium">${subtotal}</span>
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
                                        {shipping === 0 ? '$0.00' : `$${shipping}`}
                                    </span>
                                </div>

                                {/* Free Shipping Progress */}
                                {subtotal > 0 && subtotal < 1000000 && (
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaTruck className="text-blue-600" />
                                            <p className="text-xs text-blue-700 font-medium">
                                                Add ${(1000000 - subtotal)} more for FREE shipping!
                                            </p>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${(subtotal / 1000000) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Tax */}
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Tax (8%)</span>
                                    <span className="font-medium">${tax}</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-4"></div>

                            {/* Total */}
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-accent">
                                    ${total}
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
                    </div>
                </div>
            </div>
        </div>



        // Right now, just a placeholder


        // <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
        //     <h1>Hello Next.js 👋</h1>
        //     <p>Đây là một page Next.js đơn giản.</p>
        //     <button
        //         style={{
        //             marginTop: "16px",
        //             padding: "10px 16px",
        //             borderRadius: "8px",
        //             border: "none",
        //             background: "#2563eb",
        //             color: "white",
        //             cursor: "pointer"
        //         }}
        //     >
        //         Click me
        //     </button>
        // </main>
    );
}


