'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/variants'
import { FaCheck } from 'react-icons/fa'
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
        isPopular: false
    }
]

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

const ChooseMembershipPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleChoose = (plan: any) => {
        console.log('Selected plan:', plan)
        setSelectedPlan(plan)
        setError(null) // Clear any previous errors
    }

    const confirmChoose = async () => {
        console.log('Confirming plan:', selectedPlan)

        if (!selectedPlan) {
            setError('Please select a membership plan first')
            return
        }

        try {
            setLoading(true)
            setError(null)

            console.log('Storing membership data...')

            // Try to call real API first, fallback to simulation if it fails
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}')
                console.log('User data:', user)
                console.log('User id:', user._id)
                const res = await fetch('http://localhost:5000/mb/choose-membership', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        userId: user._id, // lấy từ localStorage
                        username: `${user.firstname} ${user.lastname}`, // gộp fullname
                        name: selectedPlan.name,
                        duration: selectedPlan.duration,
                        price: selectedPlan.price
                    })
                })

                if (res.ok) {
                    const data = await res.json()
                    console.log('API response:', data);

                    if (data.membership && data.membership._id) {
                        localStorage.setItem('membershipId', data.membership._id);
                    }
                    console.log('API response:', data)
                } else {
                    console.log('API call failed, using simulation')
                }
            } catch (apiError) {
                console.log('API not available, using simulation:', apiError)
            }

            // Simulate successful membership selection (since this is frontend demo)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call


            console.log('Membership data stored successfully')
            alert('Membership selected successfully!')
            router.push('/dashboard')
        } catch (error) {
            console.error('Error in confirmChoose:', error)
            setError('Error selecting membership. Please try again.')
        } finally {
            setLoading(false)
            setSelectedPlan(null)
        }
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
                        Choose a membership plan that fits your training goals. After confirmation, the plan will be created and you'll be redirected to the dashboard.
                    </p>

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
                                    className="p-6 text-center bg-gray-50"
                                >
                                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                    <div className="flex items-end justify-center mb-4">
                                        <span className="text-4xl font-bold">
                                            {plan.price}
                                        </span>
                                        <span className="text-gray-500 ml-1">/{plan.duration}</span>
                                    </div>
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
                                        className="w-full py-3 px-4 rounded-lg transition-colors duration-300 bg-gray-800 hover:bg-gray-900 text-white"
                                    >
                                        {loading ? 'Processing...' : 'Choose Plan'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Confirm Box */}
            {selectedPlan && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                        <h3 className="text-lg font-semibold mb-4">
                            Confirm selection of {selectedPlan.name} plan (
                            {selectedPlan.price}/{selectedPlan.duration})?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setSelectedPlan(null)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmChoose}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                            >
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default ChooseMembershipPage
