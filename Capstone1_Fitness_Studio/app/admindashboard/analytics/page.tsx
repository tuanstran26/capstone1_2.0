'use client'

import { useState, useEffect } from 'react'
import { 
  FiUsers, 
  FiDollarSign, 
  FiActivity, 
  FiTrendingUp,
  FiUserCheck,
  FiAward,
  FiShoppingBag,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiBarChart2
} from 'react-icons/fi'

interface User {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  createdAt: string;
}

interface Trainer {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  ptSpecialization?: string;
  ptExperience?: string;
  ptClients?: Array<{ userId: string; name: string; _id: string }>;
  createdAt: string;
}

interface Membership {
  _id: string;
  name: 'Standard' | 'Premium' | 'Elite';
  duration: number;
  createdDate: string;
  expiredDate: string;
  status: 'pending' | 'completed';
  user: string;
  username: string;
  price: number;
}

interface Order {
  _id: string;
  userId: string;
  username: string;
  finalPrice: number;
  status: 'pending' | 'shipping' | 'completed';
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
}

export default function AnalyticsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersRes, trainersRes, membershipsRes, ordersRes] = await Promise.all([
          fetch('http://localhost:5000/admin/users', { credentials: 'include' }),
          fetch('http://localhost:5000/admin/pts', { credentials: 'include' }),
          fetch('http://localhost:5000/admin/memberships', { credentials: 'include' }),
          fetch('http://localhost:5000/order/all-orders', { credentials: 'include' })
        ])
        
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data || [])
        }
        
        if (trainersRes.ok) {
          const data = await trainersRes.json()
          setTrainers(data || [])
        }
        
        if (membershipsRes.ok) {
          const data = await membershipsRes.json()
          setMemberships(data || [])
        }
        
        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setOrders(data.orders || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Calculate stats
  const totalUsers = users.length
  const totalTrainers = trainers.length
  const totalMemberships = memberships.length
  const activeMemberships = memberships.filter(m => m.status === 'completed').length
  const pendingMemberships = memberships.filter(m => m.status === 'pending').length
  
  const totalOrders = orders.length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const shippingOrders = orders.filter(o => o.status === 'shipping').length
  
  // Revenue calculations
  const totalOrderRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.finalPrice, 0)
  const totalMembershipRevenue = memberships
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.price, 0)
  const totalRevenue = totalOrderRevenue + totalMembershipRevenue
  
  // Membership breakdown
  const membershipBreakdown = {
    Standard: memberships.filter(m => m.name === 'Standard').length,
    Premium: memberships.filter(m => m.name === 'Premium').length,
    Elite: memberships.filter(m => m.name === 'Elite').length
  }
  
  // Top trainers by clients
  const topTrainers = [...trainers]
    .sort((a, b) => (b.ptClients?.length || 0) - (a.ptClients?.length || 0))
    .slice(0, 5)
  
  // Recent users
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  
  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-primary-200 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-500/30">
            <FiBarChart2 className="text-3xl text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Data Analytics</h1>
            <p className="text-gray-400">Overview of your fitness studio performance</p>
          </div>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-900/40 to-primary-300 rounded-xl p-5 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <FiUsers className="text-blue-400 text-xl" />
            </div>
            <span className="text-gray-400 text-sm">Total Members</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalUsers}</p>
          <p className="text-xs text-gray-500 mt-1">Registered users</p>
        </div>
        
        {/* Total Trainers */}
        <div className="bg-gradient-to-br from-green-900/40 to-primary-300 rounded-xl p-5 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <FiUserCheck className="text-green-400 text-xl" />
            </div>
            <span className="text-gray-400 text-sm">Personal Trainers</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalTrainers}</p>
          <p className="text-xs text-gray-500 mt-1">Active trainers</p>
        </div>
        
        {/* Active Memberships */}
        <div className="bg-gradient-to-br from-purple-900/40 to-primary-300 rounded-xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <FiAward className="text-purple-400 text-xl" />
            </div>
            <span className="text-gray-400 text-sm">Active Memberships</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeMemberships}</p>
          <p className="text-xs text-gray-500 mt-1">of {totalMemberships} total</p>
        </div>
        
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-accent/40 to-primary-300 rounded-xl p-5 border border-accent/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-accent/20 p-2 rounded-lg">
              <FiDollarSign className="text-accent text-xl" />
            </div>
            <span className="text-gray-400 text-sm">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">All time earnings</p>
        </div>
      </div>
      
      {/* Order Stats */}
      <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiShoppingBag className="text-blue-400" />
          Order Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary-200 rounded-lg p-4 text-center">
            <div className="bg-accent/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiPackage className="text-accent text-xl" />
            </div>
            <p className="text-2xl font-bold text-white">{totalOrders}</p>
            <p className="text-sm text-gray-400">Total Orders</p>
          </div>
          
          <div className="bg-primary-200 rounded-lg p-4 text-center">
            <div className="bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiClock className="text-yellow-400 text-xl" />
            </div>
            <p className="text-2xl font-bold text-white">{pendingOrders}</p>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
          
          <div className="bg-primary-200 rounded-lg p-4 text-center">
            <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiTruck className="text-blue-400 text-xl" />
            </div>
            <p className="text-2xl font-bold text-white">{shippingOrders}</p>
            <p className="text-sm text-gray-400">Shipping</p>
          </div>
          
          <div className="bg-primary-200 rounded-lg p-4 text-center">
            <div className="bg-green-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiCheckCircle className="text-green-400 text-xl" />
            </div>
            <p className="text-2xl font-bold text-white">{completedOrders}</p>
            <p className="text-sm text-gray-400">Completed</p>
          </div>
        </div>
        
        {/* Order completion rate */}
        <div className="mt-4 pt-4 border-t border-primary-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Order Completion Rate</span>
            <span className="text-white font-medium">
              {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="w-full bg-primary-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-accent to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Membership & Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Breakdown */}
        <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiAward className="text-purple-400" />
            Membership Distribution
          </h2>
          
          <div className="space-y-4">
            {/* Standard */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Standard
                </span>
                <span className="text-white font-medium">{membershipBreakdown.Standard}</span>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${totalMemberships > 0 ? (membershipBreakdown.Standard / totalMemberships) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Premium */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  Premium
                </span>
                <span className="text-white font-medium">{membershipBreakdown.Premium}</span>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${totalMemberships > 0 ? (membershipBreakdown.Premium / totalMemberships) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Elite */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  Elite
                </span>
                <span className="text-white font-medium">{membershipBreakdown.Elite}</span>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${totalMemberships > 0 ? (membershipBreakdown.Elite / totalMemberships) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-primary-100">
            <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/20">
              <p className="text-green-400 text-sm">Active</p>
              <p className="text-xl font-bold text-white">{activeMemberships}</p>
            </div>
            <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">Pending</p>
              <p className="text-xl font-bold text-white">{pendingMemberships}</p>
            </div>
          </div>
        </div>
        
        {/* Revenue Breakdown */}
        <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-green-400" />
            Revenue Sources
          </h2>
          
          <div className="space-y-4">
            {/* Product Revenue */}
            <div className="bg-primary-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <FiShoppingBag className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Product Sales</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(totalOrderRevenue)}</p>
                </div>
                <span className="text-blue-400 text-sm">
                  {totalRevenue > 0 ? ((totalOrderRevenue / totalRevenue) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-primary-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (totalOrderRevenue / totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Membership Revenue */}
            <div className="bg-primary-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <FiAward className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Memberships</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(totalMembershipRevenue)}</p>
                </div>
                <span className="text-purple-400 text-sm">
                  {totalRevenue > 0 ? ((totalMembershipRevenue / totalRevenue) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-primary-100 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (totalMembershipRevenue / totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Total */}
          <div className="mt-6 pt-4 border-t border-primary-100 text-center">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-accent mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>
      
      {/* Top Trainers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Trainers */}
        <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiActivity className="text-accent" />
            Top Trainers
          </h2>
          <div className="space-y-3">
            {topTrainers.length > 0 ? (
              topTrainers.map((trainer, index) => (
                <div key={trainer._id} className="bg-primary-200 rounded-lg p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-300' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-primary-100 text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{trainer.firstname} {trainer.lastname}</p>
                    <p className="text-gray-400 text-xs">{trainer.ptSpecialization || 'General Fitness'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent font-bold">{trainer.ptClients?.length || 0}</p>
                    <p className="text-gray-400 text-xs">clients</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No trainers found</p>
            )}
          </div>
        </div>
        
        {/* Recent Users */}
        <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiUsers className="text-blue-400" />
            Recent Members
          </h2>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user._id} className="bg-primary-200 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.firstname?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.firstname} {user.lastname}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{formatDate(user.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No users found</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiShoppingBag className="text-green-400" />
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Items</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-primary-100/50">
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-accent">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-white">{order.username}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">{order.items.length} item(s)</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                      order.status === 'shipping' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                      'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {order.status === 'completed' ? <FiCheckCircle /> :
                       order.status === 'shipping' ? <FiTruck /> :
                       <FiClock />}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-bold text-green-400">
                      {formatCurrency(order.finalPrice)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {recentOrders.length === 0 && (
            <div className="text-center py-8">
              <FiShoppingBag className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
