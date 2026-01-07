'use client'

import React from 'react'
import { FaClock, FaPhone, FaEnvelope } from 'react-icons/fa'

const ChatInfo = () => {
  return (
    <div className="bg-gray-50 p-4 border-t border-gray-200">
     
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaPhone className="text-accent" />
          <span>Hotline: 0123.456.789</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaEnvelope className="text-accent" />
          <span>Email: support@fitnessstudio.com</span>
        </div>
      </div>
    </div>
  )
}

export default ChatInfo 