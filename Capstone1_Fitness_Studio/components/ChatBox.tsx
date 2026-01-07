'use client'

import { useState, useRef, useEffect } from 'react'
import { FaComments, FaTimes, FaPaperPlane, FaArrowUp, FaInfoCircle, FaSpinner } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import ChatQuickOptions from './ChatQuickOptions'
import ChatInfo from './ChatInfo'

type Message = {
  id: string
  text: string
  isUser: boolean
  pending?: boolean
  timestamp: Date
}

type SuggestionType = {
  id: string
  text: string
}

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionType[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate unique id (timestamp + random)
  const generateId = () =>
    'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8)

  // Khởi tạo với tin nhắn chào
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: 'Hi! I can help you with anything you need.',
        isUser: false,
        timestamp: new Date()
      }
    ])
  }, [])

  const suggestionKeywords = [
    'Opening hours',
    'Classes',
    'Membership prices',
    'Personal trainers',
    'Address',
    'Yoga classes',
    'Cardio classes',
    'CrossFit classes',
    'Bodybuilding classes',
    'Basic package',
    'Standard package',
    'VIP package',
    'Platinum package',
    'Trial session',
    'Facilities',
    'Contact'
  ]

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      setUnreadCount(0)
    }
  }

  const toggleInfo = () => setShowInfo(!showInfo)

  const handleQuickOptionSelect = (optionText: string) => {
    setMessage(optionText)
    handleSubmit(null, optionText)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSuggestion(prev => (prev + 1) % suggestions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSuggestion(prev => (prev - 1 + suggestions.length) % suggestions.length)
      } else if (e.key === 'Enter' && activeSuggestion >= 0) {
        e.preventDefault()
        handleSuggestionClick(suggestions[activeSuggestion].text)
      } else if (e.key === 'Escape') {
        setSuggestions([])
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)

    if (value.length > 1) {
      const filtered = suggestionKeywords
        .filter(keyword => keyword.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
        .map((text, index) => ({ id: `suggestion-${index}`, text }))

      setSuggestions(filtered)
      setActiveSuggestion(-1)
    } else {
      setSuggestions([])
    }
  }

  const handleSubmit = async (e: React.FormEvent | null, quickOptionText?: string) => {
    if (e) e.preventDefault()
    const messageText = quickOptionText || message
    if (!messageText.trim()) return

    setSuggestions([])

    const userMessage: Message = {
      id: generateId(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    }

    const pendingMessage: Message = {
      id: generateId(),
      text: '...',
      isUser: false,
      pending: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, pendingMessage])
    setMessage('')
    setIsTyping(true)

    const user = localStorage.getItem('user')
    if (!user) {
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.pending)
        return [
          ...filtered,
          {
            id: generateId(),
            text: 'Please log in to use the chat feature.',
            isUser: false,
            timestamp: new Date()
          }
        ]
      })
      setIsTyping(false)
      return
    }
    const ptId = JSON.parse(user)?.assignedPT
    const userId = JSON.parse(user)?._id
    const firstName = JSON.parse(user)?.firstname
    const lastName = JSON.parse(user)?.lastname
    const userName = firstName + ' ' + lastName



    const ptInfo = await fetch(`http://localhost:5000/ai/trainer/${ptId}`, {
      method: 'GET',
    }).then(res => res.json())


    const user_pt_info = { userId, userName, ptId, ptName: ptInfo.ptName }
    try {
      const response = await fetch('http://127.0.0.1:7999/fitness-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_request: userMessage.text, user_pt_info })
      })

      const data = await response.json()

      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.pending)
        return [
          ...filtered,
          {
            id: generateId(),
            text: data.llm_answer || 'Sorry, I don\'t understand your question.',
            isUser: false,
            timestamp: new Date()
          }
        ]
      })

      if (!isOpen) setUnreadCount(prev => prev + 1)
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.pending)
        return [
          ...filtered,
          {
            id: generateId(),
            text: 'Sorry, an error occurred. Please try again later.',
            isUser: false,
            timestamp: new Date()
          }
        ]
      })
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full animate-pulse-slow">
          {unreadCount}
        </div>
      )}

      <button
        onClick={toggleChat}
        className="bg-accent hover:bg-accent/90 text-white rounded-full p-5 shadow-lg transition-all duration-300"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <FaTimes size={35} /> : <FaComments size={35} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-0 w-96 md:w-[28rem] bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="bg-accent text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">Online Assist</h3>
                <p className="text-sm opacity-90">We are ready to help you</p>
              </div>
              <button
                onClick={toggleInfo}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Contact information"
              >
                <FaInfoCircle size={20} />
              </button>
            </div>

            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatInfo />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="h-96 overflow-y-auto p-4 bg-gray-50"
              ref={messagesContainerRef}
              onScroll={handleScroll}
            >
              {messages.length === 1 && <ChatQuickOptions onOptionSelect={handleQuickOptionSelect} />}

              {messages.map(msg => (
                <div key={msg.id} className={`mb-3 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                  <div className="flex flex-col">
                    <div
                      className={`inline-block p-3 rounded-lg message-bubble ${msg.isUser
                        ? 'bg-accent text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        } ${msg.pending ? 'animate-pulse' : ''}`}
                    >
                      {msg.pending ? (
                        <div className="flex items-center">
                          <FaSpinner className="animate-spin mr-2" />
                          <span>Answering...</span>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-20 right-4 bg-accent text-white rounded-full p-2 shadow-md"
                aria-label="Scroll to bottom"
              >
                <FaArrowUp className="transform rotate-180" />
              </button>
            )}

            <div className="relative">
              <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter message..."
                    className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                    disabled={isTyping}
                  />

                  {suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 w-full bg-white border border-gray-300 rounded-t-lg shadow-lg max-h-40 overflow-y-auto z-10 animate-fadeIn">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.id}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${index === activeSuggestion ? 'bg-gray-100' : ''
                            }`}
                          onClick={() => handleSuggestionClick(suggestion.text)}
                        >
                          {suggestion.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className={`bg-accent text-white rounded-r-lg px-4 py-2 ${isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/90'
                    }`}
                  disabled={isTyping}
                  aria-label="Send message"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatBox
