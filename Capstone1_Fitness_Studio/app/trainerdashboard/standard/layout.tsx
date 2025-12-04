'use client'

import { useState } from 'react';
import Link from 'next/link';
// Clerk removed
import { FaBars, FaCalendarAlt, FaDumbbell, FaUserFriends, FaChartLine, 
         FaTimes } from 'react-icons/fa';
import { useMembership } from '../../../hooks/useMembership';

export default function StandardDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { membershipData, isLoading } = useMembership();

  const getMembershipDisplay = () => {
    if (isLoading) return 'Đang tải...';
    if (!membershipData || !membershipData.membershipPlan) return 'Chưa có gói';
    return `Gói ${membershipData.membershipPlan.charAt(0).toUpperCase() + membershipData.membershipPlan.slice(1)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <span className="text-lg font-bold text-accent">Fitness Studio</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <FaBars className="text-gray-600" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo and user info */}
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-xl font-bold text-accent">Fitness Studio</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">FS</div>
              <div>
                <p className="font-medium text-white">{membershipData?.fullName || 'Member'}</p>
                <p className="text-sm text-gray-300">{getMembershipDisplay()}</p>
              </div>
            </div>
          </div>

          {/* Navigation links - only show Standard plan features */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard/standard"
              className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FaChartLine className="mr-3 text-gray-400" />
              Dashboard
            </Link>
            
            <Link
              href="/dashboard/standard/schedule"
              className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FaCalendarAlt className="mr-3 text-gray-400" />
              Training Schedule
            </Link>
            
            <Link
              href="/dashboard/standard/trainers"
              className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FaUserFriends className="mr-3 text-gray-400" />
              Trainers
            </Link>
            
            <Link
              href="/dashboard/standard/progress"
              className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FaDumbbell className="mr-3 text-gray-400" />
              Progress
            </Link>

            {/* Upgrade section for standard users */}
            <div className="mt-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <h3 className="font-medium text-accent mb-2">Upgrade to Premium</h3>
              <p className="text-sm text-gray-300 mb-3">Access additional premium features</p>
              <Link
                href="/checkout?plan=premium"
                className="block text-center bg-accent hover:bg-accent/90 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          </nav>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
        >
          <FaTimes className="text-gray-600" />
        </button>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 