'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/variants'
import { FaCheck, FaCreditCard } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

const plans = [
    {
        id: 'standard',
        name: 'Standard',
        price: 500000,
        duration: 30,
        features: [
            'Gym access',
            'Personal locker',
            'Shower room',
            'Join 2 group classes/week',
            'Basic fitness assessment'
        ],
        isPopular: false
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 800000,
        duration: 30,
        features: [
            'All Standard features',
            'Unlimited group class access',
            'Personal nutrition consultation',
            '1 PT session/month',
            'Spa access',
            'Free nutritional drinks'
        ],
        isPopular: true
    }
]

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price)
}

const formatPriceUSD = (price: number) => {
    const usdPrice = price / 24000
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(usdPrice)
}

const ChooseMembershipPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Check if user already has an active membership
        if (parsedUser.membership) {
            router.push('/dashboard')
        }
    }, [router])

    const handleChoose = (plan: any) => {
        console.log('Selected plan:', plan)
        setSelectedPlan(plan)
        setError(null)
    }

    const confirmChoose = async () => {
        console.log('Confirming plan:', selectedPlan)

        if (!selectedPlan) {
            setError('Please select a membership plan first')
            return
        }

        if (!user) {
            setError('Please login first')
            router.push('/login')
            return
        }

        // Redirect to checkout page with plan info
        router.push(`/checkout?plan=${selectedPlan.id}`)
    }


    return (
        <section className="py-16 bg-gray-50 relative">
            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-4 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
                Back to Home
            </button>

            <div className="container mx-auto px-4">
                <motion.div
                    variants={fadeIn('up', 0.3)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold mb-4">Choose Membership Plan</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Choose a membership plan that fits your training goals. You will be redirected to payment after selecting a plan.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600">
                        <FaCreditCard />
                        <span>Secure payment with ZaloPay</span>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-center">{error}</p>
                        </div>
                    )}
                </motion.div>

                <div className="flex flex-wrap -mx-4 justify-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            variants={fadeIn('up', 0.2 * index)}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.2 }}
                            className="w-full md:w-1/2 lg:w-1/3 px-4 mb-8 max-w-md"
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl overflow-hidden h-full flex flex-col transition-transform duration-300 hover:scale-105 relative border border-gray-200"
                            >

                                <div
                                    className={`p-6 text-center ${plan.isPopular ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-50'}`}
                                >
                                    {plan.isPopular && (
                                        <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full mb-2">
                                            POPULAR
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                    <div className="flex flex-col items-center justify-center mb-2">
                                        <span className="text-3xl font-bold">
                                            {formatPrice(plan.price)}
                                        </span>
                                        <span className={`text-sm ${plan.isPopular ? 'text-blue-100' : 'text-gray-500'}`}>
                                            (~{formatPriceUSD(plan.price)})
                                        </span>
                                    </div>
                                    <span className={`text-sm ${plan.isPopular ? 'text-blue-100' : 'text-gray-500'}`}>
                                        /{plan.duration} days
                                    </span>
                                </div>
                                <div className="p-6 flex-grow">
                                    <ul className="space-y-3">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-start">
                                                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 pt-0">
                                    <button
                                        disabled={loading}
                                        onClick={() => handleChoose(plan)}
                                        className={`w-full py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 ${
                                            plan.isPopular 
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                                                : 'bg-gray-800 hover:bg-gray-900 text-white'
                                        }`}
                                    >
                                        <FaCreditCard />
                                        {loading ? 'Processing...' : 'Choose & Pay Now'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Confirm Box */}
            {selectedPlan && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCreditCard className="text-blue-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Confirm Payment</h3>
                            <p className="text-gray-600">
                                You are about to purchase the {selectedPlan.name} membership plan
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Plan:</span>
                                <span className="font-semibold">{selectedPlan.name}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-semibold">{selectedPlan.duration} days</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="text-gray-800 font-semibold">Total:</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {formatPrice(selectedPlan.price)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedPlan(null)}
                                className="flex-1 px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmChoose}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium flex items-center justify-center gap-2"
                            >
                                <FaCreditCard />
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default ChooseMembershipPage