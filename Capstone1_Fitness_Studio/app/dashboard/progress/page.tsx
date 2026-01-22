'use client'

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaDumbbell, FaShoppingBag, FaTrophy, FaUser, FaUserTie, FaCrown, FaChartLine } from 'react-icons/fa';
import { MdFitnessCenter } from 'react-icons/md';

interface Membership {
  _id: string;
  name: string;
  duration: number;
  status: string;
  createdDate: string;
  expiredDate: string;
  price?: number;
}

interface Schedule {
  _id: string;
  scheduleName: string;
  scheduleDate: string;
  shift: string;
  ptId: string;
  ptName: string;
  userId: string;
  userName: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface Order {
  _id: string;
  totalCartPrice: number;
  finalPrice: number;
  status: 'pending' | 'shipping' | 'completed';
  createdAt: string;
}

export default function Progress() {
  const [user, setUser] = useState<any>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [trainer, setTrainer] = useState<any>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch membership
        const membershipId = parsedUser.membership;
        if (membershipId) {
          try {
            const resMembership = await fetch(`http://localhost:5000/admin/memberships/${membershipId}`, {
              credentials: 'include',
            });
            if (resMembership.ok) {
              const membershipData = await resMembership.json();
              setMembership(membershipData);
            }
          } catch (err) {
            console.error('Error fetching membership:', err);
          }
        }

        // Fetch trainer
        const assignedPT = parsedUser.assignedPT;
        if (assignedPT) {
          try {
            const resTrainer = await fetch(`http://localhost:5000/user/trainer/${assignedPT}`, {
              credentials: 'include',
            });
            if (resTrainer.ok) {
              const trainerData = await resTrainer.json();
              setTrainer(trainerData);
            }
          } catch (err) {
            console.error('Error fetching trainer:', err);
          }
        }

        // Fetch schedules
        try {
          const resSchedule = await fetch(`http://localhost:5000/schedule/user/${parsedUser._id}`, {
            credentials: 'include',
          });
          if (resSchedule.ok) {
            const scheduleData = await resSchedule.json();
            setSchedules(scheduleData);
          }
        } catch (err) {
          console.error('Error fetching schedules:', err);
        }

        // Fetch orders
        try {
          const resOrders = await fetch(`http://localhost:5000/order/get-orders/${parsedUser._id}`, {
            credentials: 'include',
          });
          if (resOrders.ok) {
            const ordersData = await resOrders.json();
            setOrders(ordersData.orders || []);
          }
        } catch (err) {
          console.error('Error fetching orders:', err);
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate statistics
  const stats = {
    // Membership stats
    membershipDaysUsed: membership
      ? Math.max(0, Math.ceil((new Date().getTime() - new Date(membership.createdDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
    membershipDaysLeft: membership
      ? Math.max(0, Math.ceil((new Date(membership.expiredDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
    membershipProgress: membership
      ? Math.min(100, Math.max(0, ((new Date().getTime() - new Date(membership.createdDate).getTime()) / (new Date(membership.expiredDate).getTime() - new Date(membership.createdDate).getTime())) * 100))
      : 0,
    
    // Schedule stats
    totalSessions: schedules.length,
    activeSessions: schedules.filter(s => s.status === 'active').length,
    pendingSessions: schedules.filter(s => s.status === 'pending').length,
    completedSessions: schedules.filter(s => s.status === 'active' || s.status === 'rejected').length,
    
    // Order stats
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalSpent: orders.reduce((sum, order) => sum + order.finalPrice, 0),
    
    // Overall progress
    hasTrainer: !!trainer,
    hasMembership: !!membership,
  };

  // Calculate achievement rate
  const achievementRate = Math.round(
    ((stats.hasMembership ? 25 : 0) +
    (stats.hasTrainer ? 25 : 0) +
    (stats.activeSessions > 0 ? 25 : 0) +
    (stats.completedOrders > 0 ? 25 : 0))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-primary-300 rounded-xl shadow-2xl p-12 border border-primary-100 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-300 to-primary-200 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaChartLine className="text-accent text-4xl" />
              <h1 className="text-4xl font-bold text-white">Progress Tracking</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Track your fitness journey and achievements
            </p>
          </div>
          <div className="hidden md:block">
            <MdFitnessCenter className="text-accent text-7xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Achievement Score */}
      <div className="bg-gradient-to-r from-accent to-accent/80 rounded-xl shadow-2xl p-8 border border-accent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Overall Achievement</p>
            <p className="text-white text-5xl font-bold">{achievementRate}%</p>
            <p className="text-white/80 text-sm mt-2">
              {achievementRate === 100 ? 'Excellent! You\'re crushing it!' :
               achievementRate >= 75 ? 'Great progress! Keep it up!' :
               achievementRate >= 50 ? 'Good start! Stay consistent!' :
               'Start your journey today!'}
            </p>
          </div>
          <FaTrophy className="text-white text-7xl opacity-50" />
        </div>
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${achievementRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Membership Milestone */}
        <div className={`rounded-lg shadow-xl p-6 border transition-all duration-300 ${
          stats.hasMembership 
            ? 'bg-green-500/20 border-green-500' 
            : 'bg-primary-300 border-primary-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <FaCrown className={`text-4xl ${stats.hasMembership ? 'text-green-400' : 'text-gray-500'}`} />
            {stats.hasMembership && <FaCheckCircle className="text-green-400 text-2xl" />}
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Active Membership</h3>
          <p className="text-gray-400 text-sm">
            {stats.hasMembership ? 'Unlocked!' : 'Get a membership to start'}
          </p>
        </div>

        {/* Trainer Milestone */}
        <div className={`rounded-lg shadow-xl p-6 border transition-all duration-300 ${
          stats.hasTrainer 
            ? 'bg-green-500/20 border-green-500' 
            : 'bg-primary-300 border-primary-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <FaUserTie className={`text-4xl ${stats.hasTrainer ? 'text-green-400' : 'text-gray-500'}`} />
            {stats.hasTrainer && <FaCheckCircle className="text-green-400 text-2xl" />}
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Personal Trainer</h3>
          <p className="text-gray-400 text-sm">
            {stats.hasTrainer ? 'Assigned!' : 'Get a personal trainer'}
          </p>
        </div>

        {/* First Session Milestone */}
        <div className={`rounded-lg shadow-xl p-6 border transition-all duration-300 ${
          stats.activeSessions > 0 
            ? 'bg-green-500/20 border-green-500' 
            : 'bg-primary-300 border-primary-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <FaDumbbell className={`text-4xl ${stats.activeSessions > 0 ? 'text-green-400' : 'text-gray-500'}`} />
            {stats.activeSessions > 0 && <FaCheckCircle className="text-green-400 text-2xl" />}
          </div>
          <h3 className="text-white font-bold text-lg mb-2">First Training Session</h3>
          <p className="text-gray-400 text-sm">
            {stats.activeSessions > 0 ? 'Started training!' : 'Book your first session'}
          </p>
        </div>

        {/* First Purchase Milestone */}
        <div className={`rounded-lg shadow-xl p-6 border transition-all duration-300 ${
          stats.completedOrders > 0 
            ? 'bg-green-500/20 border-green-500' 
            : 'bg-primary-300 border-primary-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <FaShoppingBag className={`text-4xl ${stats.completedOrders > 0 ? 'text-green-400' : 'text-gray-500'}`} />
            {stats.completedOrders > 0 && <FaCheckCircle className="text-green-400 text-2xl" />}
          </div>
          <h3 className="text-white font-bold text-lg mb-2">First Purchase</h3>
          <p className="text-gray-400 text-sm">
            {stats.completedOrders > 0 ? 'Shop completed!' : 'Make your first purchase'}
          </p>
        </div>
      </div>

      {/* Membership Progress */}
      {membership && (
        <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
          <div className="flex items-center gap-3 mb-6">
            <FaCrown className="text-accent text-2xl" />
            <h2 className="text-2xl font-bold text-white">Membership Progress</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-primary-200 rounded-lg p-6 border border-primary-100">
              <div className="flex items-center gap-3 mb-3">
                <FaCalendarAlt className="text-blue-400 text-2xl" />
                <h3 className="text-white font-semibold">Days Active</h3>
              </div>
              <p className="text-white text-4xl font-bold">{stats.membershipDaysUsed}</p>
              <p className="text-gray-400 text-sm mt-2">Since {new Date(membership.createdDate).toLocaleDateString()}</p>
            </div>

            <div className="bg-primary-200 rounded-lg p-6 border border-primary-100">
              <div className="flex items-center gap-3 mb-3">
                <FaClock className="text-yellow-400 text-2xl" />
                <h3 className="text-white font-semibold">Days Remaining</h3>
              </div>
              <p className="text-white text-4xl font-bold">{stats.membershipDaysLeft}</p>
              <p className="text-gray-400 text-sm mt-2">Until {new Date(membership.expiredDate).toLocaleDateString()}</p>
            </div>

            <div className="bg-primary-200 rounded-lg p-6 border border-primary-100">
              <div className="flex items-center gap-3 mb-3">
                <FaCheckCircle className="text-green-400 text-2xl" />
                <h3 className="text-white font-semibold">Plan Type</h3>
              </div>
              <p className="text-white text-2xl font-bold">{membership.name}</p>
              <p className="text-gray-400 text-sm mt-2 capitalize">{membership.status}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Membership Duration</span>
              <span className="text-white font-bold">{Math.round(stats.membershipProgress)}%</span>
            </div>
            <div className="w-full bg-primary-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  stats.membershipProgress > 80 ? 'bg-red-500' : 
                  stats.membershipProgress > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${stats.membershipProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Training Statistics */}
      <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center gap-3 mb-6">
          <FaDumbbell className="text-accent text-2xl" />
          <h2 className="text-2xl font-bold text-white">Training Statistics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-primary-200 rounded-lg p-6 border border-primary-100 text-center">
            <p className="text-gray-400 text-sm mb-2">Total Sessions</p>
            <p className="text-white text-4xl font-bold">{stats.totalSessions}</p>
          </div>

          <div className="bg-primary-200 rounded-lg p-6 border border-primary-100 text-center">
            <p className="text-gray-400 text-sm mb-2">Active</p>
            <p className="text-green-400 text-4xl font-bold">{stats.activeSessions}</p>
          </div>

          <div className="bg-primary-200 rounded-lg p-6 border border-primary-100 text-center">
            <p className="text-gray-400 text-sm mb-2">Pending</p>
            <p className="text-yellow-400 text-4xl font-bold">{stats.pendingSessions}</p>
          </div>

          <div className="bg-primary-200 rounded-lg p-6 border border-primary-100 text-center">
            <p className="text-gray-400 text-sm mb-2">With Trainer</p>
            <p className="text-blue-400 text-4xl font-bold">{trainer ? '✓' : '✗'}</p>
          </div>
        </div>
      </div>

      {/* Shopping Activity */}
      <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center gap-3 mb-6">
          <FaShoppingBag className="text-accent text-2xl" />
          <h2 className="text-2xl font-bold text-white">Shopping Activity</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary-200 rounded-lg p-6 border border-primary-100">
            <p className="text-gray-400 text-sm mb-2">Total Orders</p>
            <p className="text-white text-4xl font-bold">{stats.totalOrders}</p>
          </div>

          <div className="bg-primary-200 rounded-lg p-6 border border-primary-100">
            <p className="text-gray-400 text-sm mb-2">Completed Orders</p>
            <p className="text-white text-4xl font-bold">{stats.completedOrders}</p>
          </div>

          <div className="bg-primary-200 rounded-lg p-6 border border-primary-100">
            <p className="text-gray-400 text-sm mb-2">Total Spent</p>
            <p className="text-accent text-3xl font-bold">${stats.totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary-300 to-primary-200 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center gap-3 mb-4">
          <FaUser className="text-accent text-2xl" />
          <h2 className="text-2xl font-bold text-white">Your Journey Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
          <div className="flex items-center gap-3">
            <FaCheckCircle className={`text-2xl ${stats.hasMembership ? 'text-green-400' : 'text-gray-500'}`} />
            <span>{stats.hasMembership ? 'Active membership plan' : 'No active membership'}</span>
          </div>
          <div className="flex items-center gap-3">
            <FaCheckCircle className={`text-2xl ${stats.hasTrainer ? 'text-green-400' : 'text-gray-500'}`} />
            <span>{stats.hasTrainer ? `Training with ${trainer.firstname}` : 'No assigned trainer'}</span>
          </div>
          <div className="flex items-center gap-3">
            <FaCheckCircle className={`text-2xl ${stats.totalSessions > 0 ? 'text-green-400' : 'text-gray-500'}`} />
            <span>{stats.totalSessions > 0 ? `${stats.totalSessions} training sessions booked` : 'No sessions booked yet'}</span>
          </div>
          <div className="flex items-center gap-3">
            <FaCheckCircle className={`text-2xl ${stats.totalOrders > 0 ? 'text-green-400' : 'text-gray-500'}`} />
            <span>{stats.totalOrders > 0 ? `${stats.totalOrders} orders placed` : 'No orders yet'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
