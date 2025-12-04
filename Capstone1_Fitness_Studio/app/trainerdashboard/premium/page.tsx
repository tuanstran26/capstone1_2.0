'use client'

// Clerk removed
import { FaCalendarAlt, FaDumbbell, FaUserFriends } from 'react-icons/fa';
import Link from 'next/link';

export default function PremiumDashboard() {
  // user removed

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-accent to-purple-600 rounded-lg shadow-2xl p-6 text-white border border-accent/30">
        <h1 className="text-2xl font-bold mb-2">
          Hello, Premium Member!
        </h1>
        <p>
          Welcome to Fitness Studio's Premium plan. Enjoy all our premium services!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/premium/schedule" className="block">
          <div className="bg-primary-300 rounded-lg shadow-2xl p-6 hover:shadow-3xl transition-all border border-primary-100 hover:border-accent">
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-accent text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-white">Training Schedule</h2>
            </div>
            <p className="text-gray-300">View and book exclusive classes for Premium members.</p>
          </div>
        </Link>

        <Link href="/dashboard/premium/trainers" className="block">
          <div className="bg-primary-300 rounded-lg shadow-2xl p-6 hover:shadow-3xl transition-all border border-primary-100 hover:border-accent">
            <div className="flex items-center mb-4">
              <FaUserFriends className="text-accent text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-white">Trainers</h2>
            </div>
            <p className="text-gray-300">Book sessions with our premium trainers.</p>
          </div>
        </Link>

        <Link href="/dashboard/premium/progress" className="block">
          <div className="bg-primary-300 rounded-lg shadow-2xl p-6 hover:shadow-3xl transition-all border border-primary-100 hover:border-accent">
            <div className="flex items-center mb-4">
              <FaDumbbell className="text-accent text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-white">Progress Tracking</h2>
            </div>
            <p className="text-gray-300">Detailed reports and in-depth analysis of your training progress.</p>
          </div>
        </Link>
      </div>

      <div className="bg-primary-300 rounded-lg shadow-2xl p-6 border border-primary-100">
        <h2 className="text-xl font-semibold text-white mb-4">Premium Benefits</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Unlimited access to all classes</li>
          <li>Priority booking and no waiting lists</li>
          <li>Free towels and personal items</li>
          <li>Unlimited use of premium equipment</li>
          <li>Access to exclusive Premium member events</li>
        </ul>
      </div>
    </div>
  );
} 