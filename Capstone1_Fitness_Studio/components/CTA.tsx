'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/variants'
import Link from 'next/link'
import { FaArrowRight, FaPhoneAlt } from 'react-icons/fa'

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            <span className="text-rose-400 uppercase tracking-[4px] font-medium text-sm">
              Start Today
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of members who have already achieved their fitness goals. 
              Start your journey today with a free trial session!
            </p>
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/choosemembership">
              <button className="group bg-rose-500 hover:bg-rose-600 text-white px-10 py-5 rounded-full text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center gap-3">
                Get Started Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <a href="tel:+1234567890">
              <button className="group bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-10 py-5 rounded-full text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center gap-3">
                <FaPhoneAlt />
                Call Us Now
              </button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.6)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
            className="mt-12 flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>No long-term commitment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Free consultation included</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default CTA
