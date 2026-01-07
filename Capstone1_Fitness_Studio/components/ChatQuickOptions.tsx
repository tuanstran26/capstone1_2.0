'use client'

import React from 'react'

type QuickOption = {
  id: string
  text: string
  icon?: string
}

type ChatQuickOptionsProps = {
  onOptionSelect: (option: string) => void
}

const ChatQuickOptions: React.FC<ChatQuickOptionsProps> = ({ onOptionSelect }) => {
  const quickOptions: QuickOption[] = [
    { id: '1', text: 'Opening Hours', icon: '🕒' },
    { id: '2', text: 'Training Classes', icon: '🏋️' },
    { id: '3', text: 'Membership Pricing', icon: '💰' },
    { id: '4', text: 'Personal Trainers', icon: '👨‍🏫' },
    { id: '5', text: 'Location', icon: '📍' },
    { id: '6', text: 'Trial Session', icon: '🆓' },
    { id: '7', text: 'Facilities', icon: '🏢' },
    { id: '8', text: 'Contact Us', icon: '📞' }
  ]

  // Nhóm các tùy chọn thành các danh mục
  const categories = [
    {
      title: 'General Information',
      options: quickOptions.slice(0, 5)
    },
    {
      title: 'Services',
      options: quickOptions.slice(5)
    }
  ]

  return (
    <div className="mb-6 animate-fadeIn">
      <p className="text-sm text-gray-600 mb-3 font-medium">You may ask about:</p>

      {categories.map((category, idx) => (
        <div key={`category-${idx}`} className="mb-4">
          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">{category.title}</h4>
          <div className="flex flex-wrap gap-2">
            {category.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onOptionSelect(option.text)}
                className="px-3 py-2 text-sm bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200 shadow-sm flex items-center gap-1 hover:border-gray-300"
              >
                {option.icon && <span className="text-lg">{option.icon}</span>}
                {option.text}
              </button>
            ))}
          </div>
        </div>
      ))}

     
    </div>
  )
}

export default ChatQuickOptions 