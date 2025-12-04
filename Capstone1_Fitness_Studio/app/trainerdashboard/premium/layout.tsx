'use client'

import { useState } from 'react';
import Link from 'next/link';
// Clerk removed
import { FaBars, FaCalendarAlt, FaDumbbell, FaUserFriends, FaChartLine, 
         FaTimes, FaUtensils, FaStar } from 'react-icons/fa';
import { useMembership } from '../../../hooks/useMembership';

export default function PremiumDashboardLayout({
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
                <p className="font-medium">{membershipData?.fullName || 'Hội viên'}</p>
                <p className="text-sm text-accent font-medium flex items-center">
                  <FaStar className="mr-1" />
                  {getMembershipDisplay()}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation links - show all Premium features */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard/premium"
              className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FaChartLine className="mr-3 text-gray-400" />
              Dashboard
            </Link>
            
            <Link
              href="/dashboard/premium/schedule"
              className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FaCalendarAlt className="mr-3 text-gray-400" />
              Training Schedule
            </Link>
            
            <Link
              href="/dashboard/premium/trainers"
              className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FaUserFriends className="mr-3 text-gray-400" />
              Trainers
            </Link>
            
            <Link
              href="/dashboard/premium/progress"
              className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
            >
              <FaDumbbell className="mr-3 text-gray-400" />
              Progress
            </Link>

            {/* Premium exclusive features */}
            <div className="border-t border-primary-100 pt-4 mt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Premium Features</p>
              
              <Link
                href="/dashboard/premium/nutrition"
                className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
              >
                <FaUtensils className="mr-3 text-accent" />
                Nutrition Consultation
              </Link>
              
              <Link
                href="/dashboard/premium/personal-training"
                className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-primary-100 hover:text-white transition-colors"
              >
                <FaStar className="mr-3 text-accent" />
                Personal Training
              </Link>
            </div>

            {/* Premium badge */}
            <div className="mt-8 p-4 bg-gradient-to-r from-accent to-accent/80 rounded-lg text-white border border-accent/30">
              <div className="flex items-center mb-2">
                <FaStar className="mr-2" />
                <h3 className="font-medium">Premium Member</h3>
              </div>
              <p className="text-sm opacity-90">You are using the premium plan with full features</p>
            </div>
          </nav>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-md hover:bg-primary-100 text-gray-300 hover:text-white transition-colors"
        >
          <FaTimes className="text-gray-300" />
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