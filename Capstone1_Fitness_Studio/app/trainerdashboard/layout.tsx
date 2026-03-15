'use client'

import Link from "next/link";
import { useState } from 'react';
import { FaCalendarAlt, FaUserFriends, FaChartLine, FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { useMembership } from '../../hooks/useMembership';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { membershipData } = useMembership();

  return (
    <div className="flex min-h-screen bg-primary-200">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-300 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo and user info */}
          <div className="p-4 border-b border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-accent">Fitness Studio</span>
              </Link>
              {/* Notification Bell for PT */}
              <NotificationBell />
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">FS</div>
              <div>
                <p className="font-medium text-white">{membershipData?.fullName || 'Member'}</p>
                <p className="text-sm text-gray-300">{membershipData?.membershipPlan ? `${membershipData.membershipPlan} Plan` : 'No Plan'}</p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/trainerdashboard"
              className="flex items-center p-3 rounded-md hover:bg-primary-100 text-gray-200 hover:text-accent transition-colors">
              <FaChartLine className="mr-3" />
              <span>Overview</span>
            </Link>
            <Link href="/trainerdashboard/schedule"
              className="flex items-center p-3 rounded-md hover:bg-primary-100 text-gray-200 hover:text-accent transition-colors">
              <FaCalendarAlt className="mr-3" />
              <span>Training Schedule</span>
            </Link>
            <Link href="/trainerdashboard/clients"
              className="flex items-center p-3 rounded-md hover:bg-primary-100 text-gray-200 hover:text-accent transition-colors">
              <FaUserFriends className="mr-3" />
              <span>Clients</span>
            </Link>
            <Link href="/trainerdashboard/profile"
              className="flex items-center p-3 rounded-md hover:bg-primary-100 text-gray-200 hover:text-accent transition-colors">
              <FaUser className="mr-3" />
              <span>My Profile</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-primary-100">
            <Link href="/"
              className="flex items-center p-2 text-sm text-gray-300 hover:text-accent transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
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
  );
} 