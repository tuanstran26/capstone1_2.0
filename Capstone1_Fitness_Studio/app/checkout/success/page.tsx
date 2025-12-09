'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaSpinner, FaTimesCircle, FaHome } from 'react-icons/fa'
import ClientOnly from '../../../components/ClientOnly'

export const dynamic = 'force-dynamic';

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking')
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(10) // Countdown từ 10 giây

  useEffect(() => {
    setMounted(true)
    
    const checkPaymentStatus = async () => {
      try {
        // Get payment info from localStorage
        const pendingPayment = localStorage.getItem('pendingPayment')
        if (!pendingPayment) {
          setStatus('failed')
          return
        }

        const paymentData = JSON.parse(pendingPayment)
        setPaymentInfo(paymentData)

        // Check payment status with backend
        const response = await fetch('http://localhost:5000/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: paymentData.paymentId })
        })

        const result = await response.json()

        if (result.success && result.payment.status === 'completed') {
          setStatus('success')
          // Clear pending payment
          localStorage.removeItem('pendingPayment')
          
          // Start countdown for auto redirect
          startCountdown()
        } else {
          // Keep checking for a few more times
          setTimeout(checkPaymentStatus, 3000)
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        setStatus('failed')
      }
    }

    // Only run on client after mount
    checkPaymentStatus()
  }, [])

  // Countdown timer for auto redirect
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Show loading state during SSR
  if (!mounted) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang kiểm tra thanh toán...</h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </ClientOnly>
    )
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleRetry = () => {
    router.push('/checkout')
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <FaSpinner className="text-6xl text-blue-500" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Đang xác nhận thanh toán...
          </h1>
          
          <p className="text-gray-600 mb-8">
            Vui lòng đợi trong khi chúng tôi xác nhận giao dịch của bạn.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 Quá trình này có thể mất vài giây. Vui lòng không tắt trang này.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12">
        <div className="max-w-2xl w-full mx-auto text-center px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-5xl text-green-500" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Thanh toán thành công!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Chúc mừng! Bạn đã trở thành thành viên của Fitness Studio.
            </p>
          </motion.div>

          {/* Payment Info Card */}
          {paymentInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8 mb-8"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Thông tin đăng ký</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Gói thành viên</p>
                  <p className="font-semibold text-lg text-accent">
                    {paymentInfo.plan?.name || 'Gói thành viên'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Thời hạn</p>
                  <p className="font-semibold">30 ngày</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Họ tên</p>
                  <p className="font-semibold">{paymentInfo.personalInfo?.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Email</p>
                  <p className="font-semibold">{paymentInfo.personalInfo?.email}</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 text-sm font-medium">
                  ✅ Tài khoản của bạn đã được kích hoạt. Bạn có thể bắt đầu sử dụng dịch vụ ngay bây giờ!
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                <FaHome />
                Về trang chủ
              </button>
              
              <button
                onClick={handleGoToDashboard}
                className="flex items-center justify-center gap-2 border-2 border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Vào Dashboard
              </button>
            </div>
            
            {/* Auto redirect countdown */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                🕐 Tự động chuyển về trang chủ sau <span className="font-bold">{countdown}</span> giây
              </p>
              <button
                onClick={handleGoHome}
                className="text-blue-600 hover:text-blue-800 text-sm underline mt-1"
              >
                Chuyển ngay
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Thanh toán thất bại
          </h1>
          
          <p className="text-gray-600 mb-8">
            Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
          </p>
        </motion.div>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full bg-accent hover:bg-accent/90 text-white py-3 rounded-lg font-semibold"
          >
            Thử lại
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}
