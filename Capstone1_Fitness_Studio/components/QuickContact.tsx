'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/variants'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa'

const contactInfo = [
  {
    icon: <FaPhone className="w-6 h-6" />,
    title: 'Call Us',
    info: '+1 (555) 123-4567',
    link: 'tel:+15551234567'
  },
  {
    icon: <FaEnvelope className="w-6 h-6" />,
    title: 'Email Us',
    info: 'info@fitnessstudio.com',
    link: 'mailto:info@fitnessstudio.com'
  },
  {
    icon: <FaMapMarkerAlt className="w-6 h-6" />,
    title: 'Visit Us',
    info: '123 Fitness St, Health City',
    link: 'https://maps.google.com'
  },
  {
    icon: <FaClock className="w-6 h-6" />,
    title: 'Hours',
    info: 'Mon-Fri: 6AM-10PM',
    link: null
  }
]

const QuickContact = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item, index) => (
            <motion.div
              key={index}
              variants={fadeIn('up', 0.1 * index)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
            >
              {item.link ? (
                <a
                  href={item.link}
                  target={item.link.startsWith('http') ? '_blank' : undefined}
                  rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-rose-500 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm group-hover:text-rose-500 transition-colors">
                        {item.info}
                      </p>
                    </div>
                  </div>
                </a>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="text-rose-500">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.info}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default QuickContact
