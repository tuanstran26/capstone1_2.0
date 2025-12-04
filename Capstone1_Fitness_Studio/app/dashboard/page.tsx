'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaUserFriends, FaDumbbell, FaChartLine, FaCheckCircle } from 'react-icons/fa';

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
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Lấy membershipId
      let membershipId = parsedUser.membership;
      let assignedPT = parsedUser.assignedPT;
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
    }
  }, []);

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          {greeting},{' '}
          {user ? `${user.firstname} ${user.lastname}` : 'User'}
        </h1>
        <p className="text-gray-300">
          Welcome back to Fitness Studio
        </p>
      </div>

      {/* Membership info */}
      {membership && (
        <div className="bg-primary-300 rounded-lg shadow-2xl p-6 mb-8 border border-primary-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Membership Information</h2>
            <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
              {membership.name} Plan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">Start Date</p>
              <p className="font-medium text-white">
                {new Date(membership.createdDate).toLocaleDateString('en-US')}
              </p>
            </div>
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">End Date</p>
              <p className="font-medium text-white">
                {new Date(membership.expiredDate).toLocaleDateString('en-US')}
              </p>
            </div>
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">Time Remaining</p>
              <p className="font-medium text-white">
                {daysLeft !== null ? `${daysLeft} days` : '---'}
              </p>
            </div>
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">Plan Price</p>
              <p className="font-medium  text-white">
                {membership.price ? membership.price : '---'}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/checkout" className="text-accent hover:text-accent/80 transition-colors font-medium">
              Upgrade Plan
            </Link>
          </div>
        </div>
      )}
      {/* Personal Trainer Info */}
      {trainer && (
        <div className="bg-primary-300 rounded-lg shadow-2xl p-6 mb-8 border border-primary-100">
          <h2 className="text-xl font-bold text-white mb-4">Your Personal Trainer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">Name</p>
              <p className="font-medium text-white">
                {trainer.firstname} {trainer.lastname}
              </p>
            </div>
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">Specialization</p>
              <p className="font-medium text-white">
                {trainer.ptSpecialization || 'Not available'}
              </p>
            </div>
            <div className="bg-primary-200 p-4 rounded-md border border-primary-100">
              <p className="text-sm text-gray-300">Experience</p>
              <p className="font-medium text-white">
                {trainer.ptExperience || 'Not available'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
