'use client'

// Clerk removed
import { FaCalendarAlt, FaDumbbell, FaUserFriends, FaStar, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useMembership } from '../../../hooks/useMembership';

export default function StandardDashboard() {
  const { membershipData, isLoading, error } = useMembership();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getDaysLeft = () => {
    if (!membershipData?.membershipEndDate) return 0;
    const endDate = new Date(membershipData.membershipEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const standardBenefits = [
    'Access to basic gym facilities',
    'Join group fitness classes',
    'Track workout progress',
    'Support from trainers',
    'Use training equipment',
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-primary-300 rounded-lg shadow-2xl p-6 border border-primary-100">
          <div className="animate-pulse">
            <div className="h-8 bg-primary-200 rounded mb-4"></div>
            <div className="h-4 bg-primary-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-primary-300 rounded-lg shadow-2xl p-6 border border-primary-100">
        <h1 className="text-2xl font-bold text-white mb-2">
          Hello, {membershipData?.fullName || 'Member'}!
        </h1>
        <p className="text-gray-300">
          {membershipData?.isActive 
            ? 'Welcome to Fitness Studio\'s Standard plan. Start your fitness journey today!'
            : 'Please register for a membership plan to begin your fitness journey at Fitness Studio!'
          }
        </p>
      </div>

      {/* Membership status */}
      {membershipData && (
        <div className="bg-primary-300 rounded-lg shadow-2xl p-6 border border-primary-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Membership Information</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              membershipData.isActive 
                ? 'bg-accent text-white'
                : 'bg-primary-200 text-gray-300'
            }`}>
              {membershipData.membershipPlan 
                ? `${membershipData.membershipPlan.charAt(0).toUpperCase() + membershipData.membershipPlan.slice(1)} Plan`
                : 'No Plan'
              }
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">Start Date</p>
              <p className="font-medium text-white">{formatDate(membershipData.membershipStartDate)}</p>
            </div>
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">End Date</p>
              <p className="font-medium text-white">{formatDate(membershipData.membershipEndDate)}</p>
            </div>
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">Time Remaining</p>
              <p className="font-medium text-white">{getDaysLeft()} days</p>
            </div>
          </div>

          {membershipData.isActive && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-white">Standard Plan Benefits</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {standardBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheckCircle className="text-accent mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/standard/schedule" className="block">
          <div className="bg-primary-300 rounded-lg shadow-2xl p-6 hover:shadow-3xl transition-all border border-primary-100 hover:border-accent">
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-accent text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-white">Training Schedule</h2>
            </div>
            <p className="text-gray-300">View training schedule and register for upcoming classes.</p>
          </div>
        </Link>

        <Link href="/dashboard/standard/trainers" className="block">
          <div className="bg-primary-300 rounded-lg shadow-2xl p-6 hover:shadow-3xl transition-all border border-primary-100 hover:border-accent">
            <div className="flex items-center mb-4">
              <FaUserFriends className="text-accent text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-white">Trainers</h2>
            </div>
            <p className="text-gray-300">Learn about our team of professional trainers.</p>
          </div>
        </Link>

        <Link href="/dashboard/standard/progress" className="block">
          <div className="bg-primary-300 rounded-lg shadow-2xl p-6 hover:shadow-3xl transition-all border border-primary-100 hover:border-accent">
            <div className="flex items-center mb-4">
              <FaDumbbell className="text-accent text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-white">Progress Tracking</h2>
            </div>
            <p className="text-gray-300">Track your training progress and achievements.</p>
          </div>
        </Link>
      </div>

      {/* Upgrade section */}
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg shadow-2xl p-6 border border-accent/30">
        <div className="flex items-center mb-4">
          <FaStar className="text-accent text-2xl mr-3" />
          <h2 className="text-xl font-semibold text-white">Upgrade to Premium</h2>
        </div>
        <p className="text-gray-300 mb-4">
          Upgrade to the Premium plan for more exciting features like nutrition consultation and personal training sessions with a trainer.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/checkout?plan=premium" className="inline-block bg-accent hover:bg-accent/90 text-white rounded-md px-6 py-2 font-medium transition-colors">
            Upgrade Now
          </Link>
          <Link href="/pricing" className="inline-block border border-accent text-accent hover:bg-accent hover:text-white rounded-md px-6 py-2 font-medium transition-colors">
            View Details
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300">Error loading membership information: {error}</p>
        </div>
      )}
    </div>
  );
} 