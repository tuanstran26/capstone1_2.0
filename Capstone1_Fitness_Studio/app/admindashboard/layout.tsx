'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiUsers,
  FiActivity,
  FiDollarSign,
  FiHome,
  FiSettings,
  FiCalendar,
  FiPackage,
  FiBarChart2,
  FiMessageSquare,
  FiArrowLeft,
  FiMenu,
  FiX
} from 'react-icons/fi'
import { SiTrainerroad } from "react-icons/si";
import { FaShoppingBag } from "react-icons/fa";


export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admindashboard', icon: FiHome },
    { name: 'User Management', href: '/admindashboard/users', icon: FiUsers },
    { name: 'Trainers', href: '/admindashboard/trainers', icon: FiActivity },
    { name: 'Membership Plans', href: '/admindashboard/memberships', icon: FiPackage },
    { name: 'Create Trainer', href: '/admindashboard/creatept', icon: SiTrainerroad },
    { name: 'Orders', href: '/admindashboard/orders', icon: FaShoppingBag },
    { name: 'Financial', href: '/admindashboard/financial', icon: FiDollarSign },
    { name: 'Classes & Schedule', href: '/admindashboard/classes', icon: FiCalendar },
    { name: 'Analytics', href: '/admindashboard/analytics', icon: FiBarChart2 },
    // { name: 'Communications', href: '/admindashboard/communications', icon: FiMessageSquare },
    // { name: 'Settings', href: '/admindashboard/settings', icon: FiSettings },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          {sidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl`}>
        <div className="flex flex-col h-full">
          {/* Logo and title */}
          <div className="flex items-center justify-between px-4 py-5 bg-primary-200 border-b border-primary-100">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">Admin Portal</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {/* Home button */}
            <Link
              href="/"
              className="group flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FiArrowLeft className="mr-3 h-5 w-5 text-accent" />
              Back to Homepage
            </Link>

            <div className="border-t border-primary-100 my-3"></div>

            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                    ? 'bg-accent text-white shadow-lg'
                    : 'text-gray-300 hover:bg-primary-100 hover:text-white'
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-accent'
                      }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Admin info */}
          <div className="p-4 bg-primary-200 text-white border-t border-primary-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="font-medium text-sm">AD</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-300">System Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 bg-primary-200 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
} 