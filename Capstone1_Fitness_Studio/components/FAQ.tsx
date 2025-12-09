'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn } from '@/lib/variants'
import { FaPlus, FaMinus } from 'react-icons/fa'

const faqs = [
  {
    question: 'What are your operating hours?',
    answer: 'We are open Monday to Friday from 6:00 AM to 10:00 PM, and weekends from 7:00 AM to 9:00 PM. Our 24/7 access is available for Premium members.'
  },
  {
    question: 'Do I need to book classes in advance?',
    answer: 'Yes, we recommend booking classes in advance through our mobile app or website to secure your spot. Walk-ins are welcome subject to availability.'
  },
  {
    question: 'What should I bring to my first session?',
    answer: 'Bring comfortable workout clothes, athletic shoes, a water bottle, and a towel. We provide lockers, showers, and basic amenities for your convenience.'
  },
  {
    question: 'Can I freeze my membership?',
    answer: 'Yes, you can freeze your membership for up to 3 months per year for medical reasons or travel. Please contact our front desk for assistance.'
  },
  {
    question: 'Do you offer personal training?',
    answer: 'Absolutely! We have certified personal trainers available for one-on-one or small group sessions. Premium members get 1 free PT session per month.'
  },
  {
    question: 'Is there parking available?',
    answer: 'Yes, we offer free parking for all members. We have a spacious parking lot with 24/7 security and well-lit areas for your safety.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'You can cancel your membership at any time with 30 days notice. No long-term contracts required. Please review your membership agreement for specific terms.'
  },
  {
    question: 'Do you offer nutrition counseling?',
    answer: 'Yes! All Premium members receive complimentary nutrition consultations. Standard members can book nutrition sessions at a discounted rate.'
  }
]

interface FAQItemProps {
  faq: {
    question: string
    answer: string
  }
  index: number
  isOpen: boolean
  toggleOpen: () => void
}

const FAQItem = ({ faq, index, isOpen, toggleOpen }: FAQItemProps) => {
  return (
    <motion.div
      variants={fadeIn('up', 0.1 * index)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
      className="border-b border-gray-200 last:border-0"
    >
      <button
        onClick={toggleOpen}
        className="w-full py-6 flex justify-between items-center text-left hover:text-rose-500 transition-colors group"
      >
        <span className="text-lg font-semibold pr-8">{faq.question}</span>
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
          {isOpen ? <FaMinus /> : <FaPlus />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-white" id="faq">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
            className="text-center mb-16"
          >
            <span className="text-rose-500 uppercase tracking-[4px] font-medium">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Frequently Asked <span className="text-rose-500">Questions</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Have questions? We've got answers. If you can't find what you're looking for, 
              feel free to contact our friendly staff.
            </p>
          </motion.div>

          {/* FAQ List */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                toggleOpen={() => toggleFAQ(index)}
              />
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            variants={fadeIn('up', 0.8)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a 
              href="mailto:info@fitnessstudio.com"
              className="inline-block bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
