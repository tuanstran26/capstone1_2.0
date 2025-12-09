'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/variants'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(2024) // Default fallback

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8" id="contact">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Fitness Studio</h3>
            <div className="mb-4 relative w-[120px] h-[60px]">
              <Image 
                src="/Logo.png" 
                alt="Fitness Studio Logo" 
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Empowering you to achieve your fitness goals with expert guidance, state-of-the-art equipment, and a supportive community.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-800 hover:bg-rose-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300">
                <FaFacebook />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-rose-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300">
                <FaTwitter />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-rose-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300">
                <FaInstagram />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-rose-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300">
                <FaYoutube />
              </a>
            </div>
          </motion.div>
          
          {/* Column 2: Quick Links */}
          <motion.div
            variants={fadeIn('up', 0.3)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">About Us</Link>
              </li>
              <li>
                <Link href="#classes" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">Classes</Link>
              </li>
              <li>
                <Link href="#team" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">Our Team</Link>
              </li>
              <li>
                <Link href="#membership" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">Membership</Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">Testimonials</Link>
              </li>
              <li>
                <Link href="#blog" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">Blog</Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">Contact</Link>
              </li>
            </ul>
          </motion.div>
          
          {/* Column 3: Contact Info */}
          <motion.div
            variants={fadeIn('up', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-rose-400 mt-1 mr-3" />
                <span className="text-gray-400">123 Fitness Street, Workout City, WC 12345</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-rose-400 mr-3" />
                <a href="tel:+11234567890" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">+1 (123) 456-7890</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-rose-400 mr-3" />
                <a href="mailto:info@fitnessstudio.com" className="text-gray-400 hover:text-rose-400 transition-colors duration-300">info@fitnessstudio.com</a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Working Hours</h4>
              <p className="text-gray-400">Monday - Friday: 6:00 AM - 10:00 PM</p>
              <p className="text-gray-400">Saturday - Sunday: 8:00 AM - 8:00 PM</p>
            </div>
          </motion.div>
          
          {/* Column 4: Newsletter */}
          <motion.div
            variants={fadeIn('up', 0.5)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter to receive the latest updates, fitness tips, and special offers.
            </p>
            <form className="mb-4">
              <div className="flex flex-col space-y-3">
                <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                >
                  Subscribe
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-500">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </motion.div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {currentYear} Fitness Studio. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-gray-500">
              <a href="#" className="hover:text-rose-400 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-rose-400 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-rose-400 transition-colors duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
