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
  FiArrowDown,
  FiUserPlus,
  FiAward
} from 'react-icons/fi'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts'

// Revenue data type
interface MonthlyData {
  month: string;
  revenue: number;
  members: number;
}

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState('activity')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [totalUser, setTotalUser] = useState(0)
  const [totalPt, setTotalPt] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [previousMonthRevenue, setPreviousMonthRevenue] = useState(0)
  const [newMembersThisMonth, setNewMembersThisMonth] = useState(0)
  const [previousMonthMembers, setPreviousMonthMembers] = useState(0)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [allPTs, setAllPTs] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<MonthlyData[]>([])
  const [userGrowthData, setUserGrowthData] = useState<MonthlyData[]>([])

  // Calculate percentage change
  const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current > 0 }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 }
  }

  const revenueChange = calculateChange(monthlyRevenue, previousMonthRevenue)
  const membersChange = calculateChange(newMembersThisMonth, previousMonthMembers)

  const stats = [
    { 
      name: 'Total Users', 
      state: totalUser, 
      icon: FiUsers,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/10',
      iconBg: 'bg-blue-500/20',
      change: null
    },
    { 
      name: 'Active Trainers', 
      state: totalPt, 
      icon: FiActivity,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/10',
      iconBg: 'bg-green-500/20',
      change: null
    },
    { 
      name: 'Monthly Revenue', 
      state: monthlyRevenue.toLocaleString() + '₫', 
      icon: FiDollarSign,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/10 to-orange-600/10',
      iconBg: 'bg-amber-500/20',
      change: revenueChange
    },
    { 
      name: 'New Members', 
      state: newMembersThisMonth, 
      icon: FiUserPlus,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-500/10 to-pink-600/10',
      iconBg: 'bg-purple-500/20',
      change: membersChange
    },
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
      // 🔥 TÍNH DOANH THU VÀ XÂY DỰNG BIỂU ĐỒ
      // ======================================================

      const now = new Date();
      const currentMonth = now.getUTCMonth();     // 0-11
      const currentYear = now.getUTCFullYear();   // ví dụ 2025

      // Calculate revenue for each of the last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const revenueByMonth: MonthlyData[] = []
      const userGrowthByMonth: MonthlyData[] = []
      
      for (let i = 5; i >= 0; i--) {
        let targetMonth = currentMonth - i
        let targetYear = currentYear
        
        if (targetMonth < 0) {
          targetMonth += 12
          targetYear -= 1
        }
        
        // Calculate revenue for this month
        const monthRevenue = membershipData
          .filter((m: any) => {
            if (m.status !== "active") return false
            const created = new Date(m.createdDate)
            return (
              created.getUTCMonth() === targetMonth &&
              created.getUTCFullYear() === targetYear
            )
          })
          .reduce((sum: number, m: any) => sum + (m.price || 0), 0)
        
        // Calculate new users for this month
        const monthUsers = allUsersData.filter((u: any) => {
          const created = new Date(u.createdAt)
          return (
            created.getUTCMonth() === targetMonth &&
            created.getUTCFullYear() === targetYear
          )
        }).length
        
        revenueByMonth.push({
          month: monthNames[targetMonth],
          revenue: monthRevenue,
          members: monthUsers
        })
        
        userGrowthByMonth.push({
          month: monthNames[targetMonth],
          revenue: monthRevenue,
          members: monthUsers
        })
      }
      
      setRevenueData(revenueByMonth)
      setUserGrowthData(userGrowthByMonth)

      // Current month revenue
      const currentMonthRevenue = membershipData
        .filter((m: any) => {
          if (m.status !== "active") return false
          const created = new Date(m.createdDate)
          return (
            created.getUTCMonth() === currentMonth &&
            created.getUTCFullYear() === currentYear
          )
        })
        .reduce((sum: number, m: any) => sum + (m.price || 0), 0)

      // Previous month revenue
      let prevMonth = currentMonth - 1
      let prevYear = currentYear
      if (prevMonth < 0) {
        prevMonth = 11
        prevYear -= 1
      }
      
      const prevMonthRevenue = membershipData
        .filter((m: any) => {
          if (m.status !== "active") return false
          const created = new Date(m.createdDate)
          return (
            created.getUTCMonth() === prevMonth &&
            created.getUTCFullYear() === prevYear
          )
        })
        .reduce((sum: number, m: any) => sum + (m.price || 0), 0)

      console.log("Monthly Revenue:", currentMonthRevenue)
      console.log("Previous Month Revenue:", prevMonthRevenue)

      setMonthlyRevenue(currentMonthRevenue)
      setPreviousMonthRevenue(prevMonthRevenue)

      // New members this month
      const newMembers = userData.filter((u: any) => {
        if (!u.membership) return false
        const created = new Date(u.createdAt)
        return (
          created.getUTCMonth() === currentMonth &&
          created.getUTCFullYear() === currentYear
        )
      }).length

      // Previous month new members
      const prevMonthMembers = userData.filter((u: any) => {
        if (!u.membership) return false
        const created = new Date(u.createdAt)
        return (
          created.getUTCMonth() === prevMonth &&
          created.getUTCFullYear() === prevYear
        )
      }).length

      setNewMembersThisMonth(newMembers)
      setPreviousMonthMembers(prevMonthMembers)

      console.log("New Members This Month:", newMembers)

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="bg-primary-300 px-4 py-2 rounded-lg border border-primary-100">
          <div className="text-sm text-gray-400">Today</div>
          <div className="text-white font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-xl shadow-xl p-6 border border-primary-100 hover:scale-[1.02] transition-transform duration-300`}
          >
            {/* Background decoration */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full opacity-20 blur-2xl`}></div>
            
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-white">{stat.state}</p>
                
                {/* Trend indicator */}
                {stat.change && (
                  <div className={`flex items-center mt-2 text-sm ${stat.change.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change.isPositive ? (
                      <FiArrowUp className="w-4 h-4 mr-1" />
                    ) : (
                      <FiArrowDown className="w-4 h-4 mr-1" />
                    )}
                    <span>{stat.change.value}% vs last month</span>
                  </div>
                )}
              </div>
              
              <div className={`${stat.iconBg} p-3 rounded-xl`}>
                <stat.icon className={`h-6 w-6 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} style={{ color: stat.gradient.includes('blue') ? '#3b82f6' : stat.gradient.includes('green') ? '#22c55e' : stat.gradient.includes('amber') ? '#f59e0b' : '#a855f7' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Overview Chart */}
        <div className="bg-primary-300 overflow-hidden shadow-xl rounded-xl border border-primary-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
                <p className="text-sm text-gray-400">Last 6 months performance</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-400">Revenue</span>
                </div>
              </div>
            </div>
            
            <div className="h-72">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()}₫`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>No revenue data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-primary-300 overflow-hidden shadow-xl rounded-xl border border-primary-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">User Growth</h2>
                <p className="text-sm text-gray-400">New registrations over time</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-400">New Members</span>
                </div>
              </div>
            </div>
            
            <div className="h-72">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [value, 'New Members']}
                    />
                    <Bar 
                      dataKey="members" 
                      fill="url(#userGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>No user data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-primary-300 shadow-xl rounded-xl border border-primary-100">
        <div className="border-b border-primary-100">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('activity')}
              className={`${activeTab === 'activity'
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-gray-300 hover:text-white hover:border-primary-100'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200`}
            >
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4" />
                <span>Recent Activity</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('trainers')}
              className={`${activeTab === 'trainers'
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-gray-300 hover:text-white hover:border-primary-100'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200`}
            >
              <div className="flex items-center space-x-2">
                <FiActivity className="w-4 h-4" />
                <span>Trainer Applications</span>
              </div>
            </button>
          
          </nav>
        </div>

        <div className="px-6 py-6">
          {/* Recent Activity Tab */}
          {activeTab === "activity" && (
            <div className="flow-root">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : recentUsers.length > 0 ? (
                <ul className="-mb-8">
                  {recentUsers.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentUsers.length - 1 ? (
                          <span
                            className="absolute top-6 left-5 -ml-px h-full w-0.5 bg-gradient-to-b from-primary-100 to-transparent"
                            aria-hidden="true"
                          />
                        ) : null}

                        <div className="relative flex items-start space-x-4 group">
                          <div>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-primary-300 transition-all duration-200 group-hover:scale-110 ${
                              activity.type === "membership" 
                                ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                                : "bg-gradient-to-br from-green-500 to-emerald-600"
                            }`}>
                              {activity.type === "membership" && (
                                <FiUsers className="h-5 w-5 text-white" />
                              )}
                              {activity.type === "trainer" && (
                                <FiActivity className="h-5 w-5 text-white" />
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 bg-primary-200/50 rounded-lg p-4 hover:bg-primary-200 transition-colors duration-200">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-white">
                                {activity.name}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                activity.type === "membership"
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "bg-green-500/20 text-green-400 border border-green-500/30"
                              }`}>
                                {activity.type === "membership" ? "Member" : "Trainer"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-400">
                              {activity.action}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <FiClock className="mr-1 h-3 w-3" />
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-500" />
                  <p className="mt-4 text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          )}


          {/* Trainer Applications Tab */}
          {activeTab === 'trainers' && (
            <div className="overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : allPTs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-primary-100">
                    <thead>
                      <tr className="bg-primary-200/50">
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Trainer
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Specialization
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Experience
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-100">
                      {allPTs.map((pt, idx) => (
                        <tr key={pt._id} className={`hover:bg-primary-200/30 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-primary-300' : 'bg-primary-300/50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {pt.firstname?.charAt(0)}{pt.lastname?.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-white">{pt.firstname} {pt.lastname}</div>
                                <div className="text-sm text-gray-400">{pt.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/30">
                              {pt.ptSpecialization || 'General Fitness'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{new Date(pt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <FiAward className="mr-1 h-3 w-3" />
                              {pt.ptExperience || 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiActivity className="mx-auto h-12 w-12 text-gray-500" />
                  <p className="mt-4 text-gray-400">No trainer applications</p>
                </div>
              )}
            </div>
          )}


        
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-primary-300 shadow-xl rounded-xl p-6 border border-primary-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            <p className="text-sm text-gray-400">Common administrative tasks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admindashboard/users/new" className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 p-6 rounded-xl flex flex-col items-center justify-center border border-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/40">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity"></div>
            <div className="bg-blue-500/20 p-3 rounded-xl mb-3">
              <FiUsers className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-white">Add User</span>
            <span className="text-xs text-gray-400 mt-1">Create new account</span>
          </Link>
          <Link href="/admindashboard/classes/new" className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-600/10 hover:from-green-500/20 hover:to-emerald-600/20 p-6 rounded-xl flex flex-col items-center justify-center border border-green-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-green-500/40">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity"></div>
            <div className="bg-green-500/20 p-3 rounded-xl mb-3">
              <FiCalendar className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-sm font-medium text-white">Create Class</span>
            <span className="text-xs text-gray-400 mt-1">Schedule new session</span>
          </Link>
          <Link href="/admindashboard/financial/reports" className="group relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-600/10 hover:from-amber-500/20 hover:to-orange-600/20 p-6 rounded-xl flex flex-col items-center justify-center border border-amber-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/40">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity"></div>
            <div className="bg-amber-500/20 p-3 rounded-xl mb-3">
              <FiDollarSign className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-white">Financial Reports</span>
            <span className="text-xs text-gray-400 mt-1">View analytics</span>
          </Link>
          <Link href="/admindashboard/communications/announcement" className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-600/10 hover:from-purple-500/20 hover:to-pink-600/20 p-6 rounded-xl flex flex-col items-center justify-center border border-purple-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/40">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity"></div>
            <div className="bg-purple-500/20 p-3 rounded-xl mb-3">
              <FiAlertCircle className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-white">Announcement</span>
            <span className="text-xs text-gray-400 mt-1">Notify members</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 