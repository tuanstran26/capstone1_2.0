'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/variants'
import { FaTrophy, FaUsers, FaClock, FaHeart, FaShieldAlt, FaChartLine } from 'react-icons/fa'

const reasons = [
  {
    icon: <FaTrophy className="w-12 h-12" />,
    title: 'Award-Winning Facility',
    description: 'Recognized as the best fitness studio with state-of-the-art equipment and facilities.'
  },
  {
    icon: <FaUsers className="w-12 h-12" />,
    title: 'Expert Trainers',
    description: 'Our certified professionals have 10+ years of experience helping members achieve their goals.'
  },
  {
    icon: <FaClock className="w-12 h-12" />,
    title: 'Flexible Schedule',
    description: 'Open 6 AM - 10 PM daily with classes available at times that fit your busy lifestyle.'
  },
  {
    icon: <FaHeart className="w-12 h-12" />,
    title: 'Supportive Community',
    description: 'Join a welcoming community where everyone motivates and supports each other.'
  },
  {
    icon: <FaShieldAlt className="w-12 h-12" />,
    title: 'Safety First',
    description: 'We prioritize your safety with regular equipment maintenance and sanitization protocols.'
  },
  {
    icon: <FaChartLine className="w-12 h-12" />,
    title: 'Track Your Progress',
    description: 'Advanced tracking tools and regular assessments to monitor your fitness journey.'
  }
]

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="why-choose-us">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          variants={fadeIn('up', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-16"
        >
          <span className="text-rose-500 uppercase tracking-[4px] font-medium">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            What Makes Us <span className="text-rose-500">Different</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We're not just a gym - we're a community dedicated to transforming lives through fitness, nutrition, and support.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              variants={fadeIn('up', 0.1 * index)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2"
            >
              <div className="text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                {reason.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-rose-500 transition-colors">
                {reason.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          variants={fadeIn('up', 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          className="mt-20 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-12 text-white"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10k+</div>
              <div className="text-rose-100">Happy Members</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-rose-100">Fitness Programs</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">20+</div>
              <div className="text-rose-100">Expert Trainers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">5+</div>
              <div className="text-rose-100">Years Experience</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUs
