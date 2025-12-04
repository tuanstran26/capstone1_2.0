'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FiUsers,
  FiActivity,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi'



export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState('activity')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [totalUser, setTotalUser] = useState(0)
  const [totalPt, setTotalPt] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [newMembersThisMonth, setNewMembersThisMonth] = useState(0)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [allPTs, setAllPTs] = useState<any[]>([]);


  const stats = [
    { name: 'Total Users', state: totalUser, icon: FiUsers },
    { name: 'Active Trainers', state: totalPt, icon: FiActivity },
    { name: 'Monthly Revenue', state: monthlyRevenue.toLocaleString() + '₫', icon: FiDollarSign },
    { name: 'New Members', state: newMembersThisMonth, icon: FiTrendingUp },
  ];

  // Fetch user list from API
  const fetchData = async () => {
    try {
      setLoading(true)
      const [userRes, ptRes, membershipRes, allUsersRes] = await Promise.all([
        fetch('http://localhost:5000/admin/users', { method: 'GET', credentials: 'include' }),
        fetch('http://localhost:5000/admin/pts', { method: 'GET', credentials: 'include' }),
        fetch('http://localhost:5000/admin/memberships', { method: 'GET', credentials: 'include' }),
        fetch('http://localhost:5000/admin/all-users', { method: 'GET', credentials: 'include' })
      ])
      const userData = await userRes.json()
      const ptData = await ptRes.json()
      const membershipData = await membershipRes.json()
      const allUsersData = await allUsersRes.json()


      console.log('Fetched All Users:', allUsersData)

      setAllUsers(allUsersData)
      setAllPTs(ptData)
      setTotalUser(userData.length)
      setTotalPt(ptData.length)
      processRecentUsers(allUsersData)

      // 🔹 Fetch additional membership status for each user
      const usersWithMembership = await Promise.all(
        userData.map(async (u: any) => {
          if (u.membership) {
            try {
              const memRes = await fetch(`http://localhost:5000/admin/memberships/${u.membership}`, {
                credentials: 'include'
              })
              if (memRes.ok) {
                const memData = await memRes.json()
                return { ...u, membershipStatus: memData.status }
              }
            } catch (err) {
              console.error(`Error fetching membership for user ${u._id}`, err)
            }
          }
          return { ...u, membershipStatus: null }
        })
      )

      setUsers(usersWithMembership)


      // ======================================================
      // 🔥 TÍNH DOANH THU THÁNG HIỆN TẠI
      // ======================================================

      const now = new Date();
      const currentMonth = now.getUTCMonth();     // 0-11
      const currentYear = now.getUTCFullYear();   // ví dụ 2025

      const monthlyRevenue = membershipData
        .filter((m: any) => {
          if (m.status !== "active") return false;

          const created = new Date(m.createdDate);

          console.log("Created:", created.getUTCMonth(), created.getUTCFullYear());

          return (
            created.getUTCMonth() === currentMonth &&
            created.getUTCFullYear() === currentYear
          );
        })
        .reduce((sum: number, m: any) => sum + (m.price || 0), 0);

      console.log("Monthly Revenue:", monthlyRevenue);

      // Lưu doanh thu tháng
      setMonthlyRevenue(monthlyRevenue);

      const newMembers = userData.filter((u: any) => {
        if (!u.membership) return false; // must have membership

        const created = new Date(u.createdAt);

        return (
          created.getUTCMonth() === currentMonth &&
          created.getUTCFullYear() === currentYear
        );
      }).length;

      // Save to state
      setNewMembersThisMonth(newMembers);

      console.log("New Members This Month:", newMembers);

    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const res = await fetch(`http://localhost:5000/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        setUsers(users.filter(user => user._id !== id))
      } else {
        const errData = await res.json()
        alert(`Delete failed: ${errData.message}`)
      }
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter users
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getTimeDiffLabel = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();

    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };



  const processRecentUsers = (users: any[]) => {
    if (!users || users.length === 0) return;

    // Sort theo thời gian giảm dần
    const sorted = [...users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Format chỉ lấy 5 user mới nhất
    const formatted = sorted.slice(0, 5).map((u) => ({
      id: u._id,
      name: `${u.firstname} ${u.lastname}`,
      action:
        u.role === "pt"
          ? "PT has been created successfully"
          : "Member has registered successfully",
      time: getTimeDiffLabel(u.createdAt),
      type: u.role === "pt" ? "trainer" : "membership",
    }));

    console.log("Recent Users:", formatted);
    setRecentUsers(formatted);
  };




  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="text-sm text-gray-300">
          Today: {new Date().toLocaleDateString('en-US')}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-primary-300 rounded-lg shadow-2xl p-6 border border-primary-100"
          >
            <div className="flex items-center">
              {/* ICON */}
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-accent" />
              </div>

              {/* TITLE + VALUE */}
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">{stat.name}</dt>

                  <dd className="text-2xl font-semibold text-white">
                    {stat.state}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="bg-primary-300 overflow-hidden shadow-2xl rounded-lg border border-primary-100">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-white mb-4">Revenue Overview</h2>
            <div className="h-64 bg-primary-200 rounded-md border border-primary-100 flex items-center justify-center">
              <p className="text-gray-300">Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>

        <div className="bg-primary-300 overflow-hidden shadow-2xl rounded-lg border border-primary-100">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-white mb-4">User Growth</h2>
            <div className="h-64 bg-primary-200 rounded-md border border-primary-100 flex items-center justify-center">
              <p className="text-gray-300">User growth chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-primary-300 shadow-2xl rounded-lg border border-primary-100">
        <div className="border-b border-primary-100">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('activity')}
              className={`${activeTab === 'activity'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-300 hover:text-white hover:border-primary-100'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors`}
            >
              Recent Activity
            </button>
            <button
              onClick={() => setActiveTab('trainers')}
              className={`${activeTab === 'trainers'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-300 hover:text-white hover:border-primary-100'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors`}
            >
              Trainer Applications
            </button>
          
          </nav>
        </div>

        <div className="px-4 py-5 sm:p-6">
          {/* Recent Activity Tab */}
          {activeTab === "activity" && (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentUsers.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentUsers.length - 1 ? (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-primary-100"
                          aria-hidden="true"
                        />
                      ) : null}

                      <div className="relative flex items-start space-x-3">
                        <div>
                          <div className="relative px-1">
                            <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center ring-8 ring-primary-300">
                              {activity.type === "membership" && (
                                <FiUsers className="h-5 w-5 text-accent" />
                              )}
                              {activity.type === "trainer" && (
                                <FiActivity className="h-5 w-5 text-accent" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {activity.name}
                            </div>
                            <p className="mt-0.5 text-sm text-gray-300">
                              {activity.action}
                            </p>
                          </div>

                          <div className="mt-2 text-sm text-gray-400">
                            <p>{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

            </div>
          )}


          {/* Trainer Applications Tab */}
          {activeTab === 'trainers' && (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-100">
                  <thead className="bg-primary-200">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Submit Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Experience
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary-300 divide-y divide-primary-100">
                    {allPTs.map((pt) => (
                      <tr key={pt._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{pt.firstname} {pt.lastname}</div>
                          <div className="text-sm text-gray-300">{pt.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{pt.ptSpecialization || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{new Date(pt.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900/30 text-yellow-300 border border-yellow-500/30">
                            {pt.ptExperience || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-primary-300 shadow-2xl rounded-lg p-6 border border-primary-100">
        <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Link href="/admindashboard/users/new" className="bg-primary-200 hover:bg-primary-100 p-4 rounded-lg flex flex-col items-center justify-center border border-primary-100 transition-colors">
            <FiUsers className="h-6 w-6 text-accent" />
            <span className="mt-2 text-sm font-medium text-white">Add User</span>
          </Link>
          <Link href="/admindashboard/classes/new" className="bg-primary-200 hover:bg-primary-100 p-4 rounded-lg flex flex-col items-center justify-center border border-primary-100 transition-colors">
            <FiCalendar className="h-6 w-6 text-accent" />
            <span className="mt-2 text-sm font-medium text-white">Create New Class</span>
          </Link>
          <Link href="/admindashboard/financial/reports" className="bg-primary-200 hover:bg-primary-100 p-4 rounded-lg flex flex-col items-center justify-center border border-primary-100 transition-colors">
            <FiDollarSign className="h-6 w-6 text-accent" />
            <span className="mt-2 text-sm font-medium text-white">Financial Reports</span>
          </Link>
          <Link href="/admindashboard/communications/announcement" className="bg-primary-200 hover:bg-primary-100 p-4 rounded-lg flex flex-col items-center justify-center border border-primary-100 transition-colors">
            <FiAlertCircle className="h-6 w-6 text-accent" />
            <span className="mt-2 text-sm font-medium text-white">Create Announcement</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 