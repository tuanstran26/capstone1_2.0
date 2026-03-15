'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaUserFriends, FaDumbbell, FaChartLine, FaCheckCircle, FaClock, FaCrown, FaUser, FaShoppingCart } from 'react-icons/fa';
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

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [user, setUser] = useState<any>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [trainer, setTrainer] = useState<any>(null);

  // Format price from VND to USD
  const formatPrice = (price: number) => {
    // Convert VND to USD (approximate rate: 1 USD = 24,000 VND)
    const usdPrice = price / 24000
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(usdPrice)
  }

  const router = useRouter();

  useEffect(() => {
    // Set greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Lấy user từ localStorage
    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Fetch fresh user data from server to get updated membership
    const fetchUserData = async () => {
      try {
        const res = await fetch('http://localhost:5000/user/profile', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (res.ok) {
          const freshUserData = await res.json();
          console.log('Fresh user data:', freshUserData);
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(freshUserData));
          setUser(freshUserData);
          
          // Update membershipId if exists
          if (freshUserData.membership) {
            localStorage.setItem('membershipId', freshUserData.membership);
          }
          
          return freshUserData;
        }
      } catch (err) {
        console.log('Could not fetch fresh user data, using localStorage');
      }
      return parsedUser;
    };

    fetchUserData().then((userData) => {
      // Lấy membershipId
      let membershipId = userData.membership;
      let assignedPT = userData.assignedPT;
      if (!membershipId) {
        membershipId = localStorage.getItem('membershipId') || null;
      }
      console.log('Membership ID:', membershipId);

      // Fetch membership nếu có id hoặc lấy từ localStorage
      if (membershipId) {
        fetch(`http://localhost:5000/admin/memberships/${membershipId}`, {
          method: 'GET',
          credentials: 'include',
        })
          .then(async (res) => {
            if (!res.ok) {
              if (res.status === 404) {
                console.log('No membership found, user may not have active membership');
                return null;
              }
              throw new Error(`Failed to fetch membership: ${res.status}`);
            }
            return res.json();
          })
          .then((data: Membership | null) => {
            if (data) {
              setMembership(data);
            } else {
              console.log('No membership data received');
            }
          })
          .catch((err) => {
            console.error('Error fetching membership:', err);
            // Try to get membership from localStorage as fallback
            const storedMembership = localStorage.getItem('membershipData');
            if (storedMembership) {
              try {
                const parsedMembership = JSON.parse(storedMembership);
                // Add default dates if not present
                const membershipWithDates = {
                  ...parsedMembership,
                  createdDate: parsedMembership.createdDate || new Date().toISOString(),
                  expiredDate: parsedMembership.expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                  status: parsedMembership.status || 'active'
                };
                setMembership(membershipWithDates);
              } catch (parseError) {
                console.error('Error parsing stored membership:', parseError);
              }
            }
          });
      } else {
        // Nếu không có membershipId, thử lấy từ localStorage
        const storedMembership = localStorage.getItem('membershipData');
        if (storedMembership) {
          try {
            const parsedMembership = JSON.parse(storedMembership);
            // Add default dates if not present
            const membershipWithDates = {
              ...parsedMembership,
              createdDate: parsedMembership.createdDate || new Date().toISOString(),
              expiredDate: parsedMembership.expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              status: parsedMembership.status || 'active'
            };
            setMembership(membershipWithDates);
            console.log('Using membership data from localStorage');
          } catch (parseError) {
            console.error('Error parsing stored membership:', parseError);
          }
        }
      }
      if (assignedPT) {
        fetch(`http://localhost:5000/user/trainer/${assignedPT}`, {
          method: 'GET',
          credentials: 'include',
        })
          .then(async (res) => {
            if (!res.ok) {
              if (res.status === 404) {
                console.log('Trainer not found');
                return null;
              }
              throw new Error(`Failed to fetch trainer: ${res.status}`);
            }
            return res.json();
          })
          .then((data: any | null) => {
            if (data) {
              setTrainer(data); // lưu trực tiếp vào useState
            } else {
              console.log('No trainer data received');
              setTrainer(null);
            }
          })
          .catch((err) => {
            console.error('Error fetching trainer:', err);
            setTrainer(null);
          });
      }
    });
  }, [router]);

  // Tính số ngày còn lại
  const daysLeft = membership
    ? Math.max(
      0,
      Math.ceil(
        (new Date(membership.expiredDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      )
    )
    : null;

  // Tính phần trăm thời gian đã sử dụng
  const membershipProgress = membership
    ? Math.min(
      100,
      Math.max(
        0,
        ((new Date().getTime() - new Date(membership.createdDate).getTime()) /
          (new Date(membership.expiredDate).getTime() - new Date(membership.createdDate).getTime())) *
        100
      )
    )
    : 0;

  // Xác định màu status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-300 to-primary-200 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">
              {greeting},{' '}
              <span className="text-accent">{user ? `${user.firstname}` : 'User'}</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Ready to crush your fitness goals today?
            </p>
          </div>
          <div className="hidden md:block">
            <MdFitnessCenter className="text-accent text-7xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      {membership && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Membership Status */}
          <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getStatusColor(membership.status)}`}>
                <FaCheckCircle className="text-white text-2xl" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(membership.status)}`}>
                {membership.status.toUpperCase()}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Membership Status</h3>
            <p className="text-white text-2xl font-bold">{membership.name}</p>
          </div>

          {/* Days Remaining */}
          <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500">
                <FaClock className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Days Remaining</h3>
            <p className="text-white text-2xl font-bold">
              {daysLeft !== null ? `${daysLeft}` : '---'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {daysLeft !== null && daysLeft < 7 ? 'Expiring soon!' : 'Active membership'}
            </p>
          </div>

          {/* Plan Price */}
          <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent">
                <FaCrown className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Current Plan</h3>
            <p className="text-white text-2xl font-bold">
              {membership.price ? formatPrice(membership.price) : '---'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              /{membership.duration} days
            </p>
          </div>

          {/* Trainer Status */}
          <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${trainer ? 'bg-green-500' : 'bg-gray-500'}`}>
                <FaUserFriends className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Personal Trainer</h3>
            <p className="text-white text-2xl font-bold">
              {trainer ? 'Assigned' : 'Not Assigned'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {trainer ? `${trainer.firstname} ${trainer.lastname}` : 'Premium feature'}
            </p>
          </div>
        </div>
      )}

      {/* No Membership Banner */}
      {!membership && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-2xl p-8 border border-orange-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-full">
                <FaCrown className="text-white text-4xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">No Active Membership</h2>
                <p className="text-white/80">
                  You don't have an active membership plan yet. Subscribe now to access all gym features!
                </p>
              </div>
            </div>
            <Link
              href="/choosemembership"
              className="bg-white text-orange-600 hover:bg-orange-100 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Choose a Plan
            </Link>
          </div>
        </div>
      )}

      {/* Membership Details */}
      {membership && (
        <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaCrown className="text-accent" />
              Membership Details
            </h2>
            <Link 
              href="/checkout" 
              className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-lg transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Upgrade Plan
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Membership Duration</span>
              <span className="text-sm font-medium text-white">
                {Math.round(membershipProgress)}% used
              </span>
            </div>
            <div className="w-full bg-primary-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  membershipProgress > 80 ? 'bg-red-500' : membershipProgress > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${membershipProgress}%` }}
              />
            </div>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary-200 p-6 rounded-lg border border-primary-100">
              <div className="flex items-center gap-3 mb-3">
                <FaCalendarAlt className="text-accent text-xl" />
                <h3 className="text-white font-semibold">Start Date</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {new Date(membership.createdDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-primary-200 p-6 rounded-lg border border-primary-100">
              <div className="flex items-center gap-3 mb-3">
                <FaCalendarAlt className="text-accent text-xl" />
                <h3 className="text-white font-semibold">Expiry Date</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {new Date(membership.expiredDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Trainer Info */}
      {trainer && (
        <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
          <div className="flex items-center gap-3 mb-6">
            <FaUser className="text-accent text-2xl" />
            <h2 className="text-2xl font-bold text-white">Your Personal Trainer</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-200 p-6 rounded-lg border border-primary-100">
              <p className="text-sm text-gray-400 mb-2">Trainer Name</p>
              <p className="text-xl font-bold text-white">
                {trainer.firstname} {trainer.lastname}
              </p>
            </div>
            <div className="bg-primary-200 p-6 rounded-lg border border-primary-100">
              <p className="text-sm text-gray-400 mb-2">Specialization</p>
              <p className="text-xl font-bold text-white">
                {trainer.ptSpecialization || 'General Fitness'}
              </p>
            </div>
            <div className="bg-primary-200 p-6 rounded-lg border border-primary-100">
              <p className="text-sm text-gray-400 mb-2">Experience</p>
              <p className="text-xl font-bold text-white">
                {trainer.ptExperience || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/schedule"
            className="bg-primary-200 hover:bg-primary-100 border border-primary-100 p-6 rounded-lg transition-all duration-300 group"
          >
            <FaCalendarAlt className="text-accent text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold text-lg mb-2">My Schedule</h3>
            <p className="text-gray-400 text-sm">View and manage your training schedule</p>
          </Link>
          <Link
            href="/shopping"
            className="bg-primary-200 hover:bg-primary-100 border border-primary-100 p-6 rounded-lg transition-all duration-300 group"
          >
            <FaShoppingCart className="text-accent text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold text-lg mb-2">Shop</h3>
            <p className="text-gray-400 text-sm">Browse fitness products and equipment</p>
          </Link>
          <Link
            href="/dashboard/trainers"
            className="bg-primary-200 hover:bg-primary-100 border border-primary-100 p-6 rounded-lg transition-all duration-300 group"
          >
            <FaDumbbell className="text-accent text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold text-lg mb-2">Trainers</h3>
            <p className="text-gray-400 text-sm">Connect with professional trainers</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
