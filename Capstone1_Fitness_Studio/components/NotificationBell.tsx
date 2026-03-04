'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNotifications, Notification } from '@/lib/NotificationContext';
import { IoNotifications, IoCheckmarkDone, IoTrash, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

// Get dashboard link based on user role
const getDashboardLink = (): string => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') return '/admindashboard';
        if (user.role === 'pt') return '/trainerdashboard';
      } catch {}
    }
  }
  return '/dashboard';
};

// Icon mapping theo notification type
const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    membership_expiring: '⚠️',
    membership_expired: '❌',
    membership_created: '🎉',
    order_placed: '🛒',
    order_shipped: '🚚',
    order_delivered: '✅',
    order_cancelled: '❌',
    schedule_reminder: '⏰',
    schedule_created: '📅',
    schedule_cancelled: '🚫',
    pt_assigned: '💪',
    new_client: '👤',
    payment_success: '💰',
    payment_failed: '❌',
    system: '🔔',
  };
  return icons[type] || '🔔';
};

// Format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString('en-US');
};

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Ensure client-side only rendering for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside button
      if (buttonRef.current?.contains(target)) {
        return;
      }
      
      // Check if click is inside panel
      if (panelRef.current?.contains(target)) {
        return;
      }
      
      // Click is outside both, close the dropdown
      setIsOpen(false);
    };

    // Use mousedown for more reliable outside click detection
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type (optional)
    const data = notification.data;
    if (data?.link) {
      window.location.href = data.link;
    }
  };

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 384; // w-96 = 24rem = 384px
      let leftPos = rect.left;
      
      // Ensure dropdown doesn't go off the right edge of the screen
      if (leftPos + dropdownWidth > window.innerWidth - 16) {
        leftPos = window.innerWidth - dropdownWidth - 16;
      }
      
      // Ensure dropdown doesn't go off the left edge
      if (leftPos < 16) {
        leftPos = 16;
      }
      
      setDropdownPosition({
        top: rect.bottom + 8,
        left: leftPos,
      });
    }
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Update position on scroll/resize when open
  useEffect(() => {
    if (!isOpen) return;

    const handlePositionUpdate = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handlePositionUpdate, true);
    window.addEventListener('resize', handlePositionUpdate);

    return () => {
      window.removeEventListener('scroll', handlePositionUpdate, true);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isOpen, updatePosition]);

  // Dropdown content
  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{ 
            position: 'fixed',
            top: dropdownPosition.top, 
            left: dropdownPosition.left,
            zIndex: 99999 
          }}
          className="w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-300 to-accent px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-white/80 hover:text-white text-sm flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <IoCheckmarkDone className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Delete all notifications?')) {
                        deleteAllNotifications();
                      }
                    }}
                    className="text-white/80 hover:text-white text-sm"
                    title="Delete all"
                  >
                    <IoTrash className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto mb-2" />
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <IoNotifications className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No notifications</p>
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <span className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-medium truncate ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                        >
                          <IoClose className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 bg-gray-50 border-t border-gray-100">
                <a
                  href={getDashboardLink()}
                  className="block text-center text-sm text-accent hover:text-accent/80 py-1"
                >
                  View all
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
  );

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-2 text-white hover:text-accent transition-colors"
        aria-label="Notifications"
      >
        <IoNotifications className="w-6 h-6" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
        
        {/* Connection indicator */}
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </button>

      {/* Render dropdown via portal to body for proper z-index stacking */}
      {mounted && createPortal(dropdownContent, document.body)}
    </div>
  );
}
