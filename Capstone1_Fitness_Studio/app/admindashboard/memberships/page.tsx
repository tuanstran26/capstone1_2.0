'use client'

import { useState, useEffect } from 'react'
import {
  FiSearch,
  FiFilter,
  FiEdit3,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiX,
  FiUser,
  FiMail
} from 'react-icons/fi'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Membership {
  _id: string
  name: string
  username: string
  status: 'active' | 'pending' | 'expired'
  createdDate: string
  expiredDate: string
  price: number
  type?: string
  user?: {
    email?: string
    firstname?: string
    lastname?: string
  }
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Fetch membership list from API
  const fetchMemberships = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/admin/memberships', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await res.json()
      // Ensure data is an array
      setMemberships(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching memberships:', err)
      setMemberships([])
    } finally {
      setLoading(false)
    }
  }

  // Update status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/memberships/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const result = await res.json()
        setMemberships(memberships.map(m => m._id === id ? result.membership : m))
      } else {
        const errData = await res.json()
        alert(`Update failed: ${errData.message}`)
      }
    } catch (err) {
      console.error('Error updating membership status:', err)
    }
  }

  useEffect(() => {
    fetchMemberships()
  }, [])

  // Ensure memberships is always an array
  const membershipList = Array.isArray(memberships) ? memberships : []

  // Calculate stats
  const activeMemberships = membershipList.filter(m => m.status === 'active')
  const pendingMemberships = membershipList.filter(m => m.status === 'pending')
  const expiredMemberships = membershipList.filter(m => m.status === 'expired')
  
  // Expiring soon (within 7 days)
  const expiringSoon = membershipList.filter(m => {
    if (m.status !== 'active') return false
    const daysUntilExpiry = Math.ceil((new Date(m.expiredDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  })

  // Total revenue
  const totalRevenue = membershipList.reduce((sum, m) => sum + (m.price || 0), 0)
  const activeRevenue = activeMemberships.reduce((sum, m) => sum + (m.price || 0), 0)

  // Pie chart data
  const pieData = [
    { name: 'Active', value: activeMemberships.length, color: '#22c55e' },
    { name: 'Pending', value: pendingMemberships.length, color: '#eab308' },
    { name: 'Expired', value: expiredMemberships.length, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // Filter memberships
  const filteredMemberships = membershipList
    .filter((m) => {
      const userName = m.username || ''
      const email = m.user?.email || ''
      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    .filter((m) => {
      if (activeTab === 'all') return true
      if (activeTab === 'expiring') {
        const daysUntilExpiry = Math.ceil((new Date(m.expiredDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return m.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry > 0
      }
      return m.status === activeTab
    })

  const getDaysUntilExpiry = (expiredDate: string) => {
    const days = Math.ceil((new Date(expiredDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          bg: 'bg-green-500/20', 
          text: 'text-green-400', 
          border: 'border-green-500/30',
          icon: FiCheckCircle,
          gradient: 'from-green-500 to-emerald-600'
        }
      case 'pending':
        return { 
          bg: 'bg-yellow-500/20', 
          text: 'text-yellow-400', 
          border: 'border-yellow-500/30',
          icon: FiClock,
          gradient: 'from-yellow-500 to-amber-600'
        }
      case 'expired':
        return { 
          bg: 'bg-red-500/20', 
          text: 'text-red-400', 
          border: 'border-red-500/30',
          icon: FiXCircle,
          gradient: 'from-red-500 to-rose-600'
        }
      default:
        return { 
          bg: 'bg-gray-500/20', 
          text: 'text-gray-400', 
          border: 'border-gray-500/30',
          icon: FiClock,
          gradient: 'from-gray-500 to-gray-600'
        }
    }
  }

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('premium') || name.includes('vip')) return 'from-amber-500 to-yellow-500'
    if (name.includes('standard')) return 'from-blue-500 to-indigo-500'
    if (name.includes('basic')) return 'from-gray-500 to-gray-600'
    return 'from-accent to-accent/80'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Membership Plans</h1>
          <p className="text-gray-400 mt-1">Monitor and manage all member subscriptions</p>
        </div>
        <button 
          onClick={fetchMemberships}
          className="flex items-center gap-2 px-4 py-2 bg-primary-200 hover:bg-primary-100 rounded-lg text-white transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-primary-300 rounded-xl p-6 border border-primary-100 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Membership Distribution</h3>
          <div className="h-48">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl p-6 border border-accent/20 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-accent/20 p-3 rounded-xl">
              <FiDollarSign className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-white">Revenue</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-white">{totalRevenue.toLocaleString()}₫</p>
            </div>
            <div className="pt-4 border-t border-primary-100">
              <p className="text-sm text-gray-400">From Active Plans</p>
              <p className="text-xl font-semibold text-green-400">{activeRevenue.toLocaleString()}₫</p>
            </div>
          </div>
        </div>

        {/* Expiring Soon Alert */}
        <div className={`rounded-xl p-6 border shadow-xl ${
          expiringSoon.length > 0 
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/5 border-amber-500/20' 
            : 'bg-primary-300 border-primary-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${expiringSoon.length > 0 ? 'bg-amber-500/20' : 'bg-primary-200'}`}>
              <FiAlertTriangle className={`w-6 h-6 ${expiringSoon.length > 0 ? 'text-amber-400' : 'text-gray-400'}`} />
            </div>
            <h3 className="text-lg font-semibold text-white">Expiring Soon</h3>
          </div>
          
          {expiringSoon.length > 0 ? (
            <div className="space-y-3">
              <p className="text-4xl font-bold text-amber-400">{expiringSoon.length}</p>
              <p className="text-sm text-gray-400">memberships expiring within 7 days</p>
              <div className="pt-3 border-t border-amber-500/20">
                {expiringSoon.slice(0, 2).map(m => (
                  <div key={m._id} className="flex items-center justify-between py-1">
                    <span className="text-sm text-white truncate">{m.username}</span>
                    <span className="text-xs text-amber-400">{getDaysUntilExpiry(m.expiredDate)} days left</span>
                  </div>
                ))}
                {expiringSoon.length > 2 && (
                  <p className="text-xs text-gray-400 mt-2">+{expiringSoon.length - 2} more</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <FiCheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-gray-400">No memberships expiring soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-primary-300 rounded-xl border border-primary-100 shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-primary-100 overflow-x-auto">
          {[
            { id: 'all', label: 'All Plans', count: memberships.length },
            { id: 'active', label: 'Active', count: activeMemberships.length },
            { id: 'pending', label: 'Pending', count: pendingMemberships.length },
            { id: 'expired', label: 'Expired', count: expiredMemberships.length },
            { id: 'expiring', label: 'Expiring Soon', count: expiringSoon.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent bg-accent/5'
                  : 'text-gray-400 hover:text-white hover:bg-primary-200/50'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-accent/20 text-accent' : 'bg-primary-200 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-primary-100">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, email, or plan..."
              className="w-full pl-10 pr-4 py-2.5 border border-primary-100 rounded-lg bg-primary-200 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Membership List */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : filteredMemberships.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-4 text-gray-400">No memberships found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMemberships.map((m) => {
                const statusConfig = getStatusConfig(m.status)
                const daysLeft = getDaysUntilExpiry(m.expiredDate)
                const StatusIcon = statusConfig.icon
                
                return (
                  <div 
                    key={m._id}
                    className="group bg-primary-200/50 hover:bg-primary-200 rounded-xl p-4 transition-all duration-200 cursor-pointer"
                    onClick={() => { setSelectedMembership(m); setShowModal(true) }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Plan Badge */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getPlanColor(m.name)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-white">{m.username}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3" />
                            {m.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span className={`font-medium bg-gradient-to-r ${getPlanColor(m.name)} bg-clip-text text-transparent`}>
                            {m.name}
                          </span>
                          <span>•</span>
                          <span>{m.price?.toLocaleString()}₫</span>
                        </div>
                      </div>

                      {/* Expiry Info */}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400">Expires</p>
                        <p className="text-sm text-white">{new Date(m.expiredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        {m.status === 'active' && daysLeft <= 7 && daysLeft > 0 && (
                          <span className="text-xs text-amber-400">{daysLeft} days left</span>
                        )}
                      </div>

                      {/* Quick Status Update */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <select
                          className="border border-primary-100 bg-primary-300 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                          value={m.status}
                          onChange={(e) => updateStatus(m._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedMembership && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-primary-300 rounded-2xl w-full max-w-lg border border-primary-100 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className={`h-24 bg-gradient-to-r ${getPlanColor(selectedMembership.name)} relative`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-6 translate-y-1/2">
                <div className="w-16 h-16 rounded-xl bg-primary-300 border-4 border-primary-300 flex items-center justify-center text-2xl font-bold text-white shadow-lg bg-gradient-to-br from-primary-200 to-primary-300">
                  {selectedMembership.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="pt-12 px-6 pb-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedMembership.name}</h3>
                  <p className="text-gray-400">{selectedMembership.username}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${getStatusConfig(selectedMembership.status).bg} ${getStatusConfig(selectedMembership.status).text} border ${getStatusConfig(selectedMembership.status).border}`}>
                  {selectedMembership.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <FiDollarSign className="w-4 h-4" />
                    <span className="text-sm">Price</span>
                  </div>
                  <p className="text-xl font-bold text-white">{selectedMembership.price?.toLocaleString()}₫</p>
                </div>
                
                <div className="bg-primary-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <FiClock className="w-4 h-4" />
                    <span className="text-sm">Days Left</span>
                  </div>
                  <p className={`text-xl font-bold ${getDaysUntilExpiry(selectedMembership.expiredDate) <= 7 ? 'text-amber-400' : 'text-white'}`}>
                    {Math.max(0, getDaysUntilExpiry(selectedMembership.expiredDate))} days
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-primary-100">
                  <span className="text-gray-400">Created Date</span>
                  <span className="text-white">{new Date(selectedMembership.createdDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-primary-100">
                  <span className="text-gray-400">Expiry Date</span>
                  <span className="text-white">{new Date(selectedMembership.expiredDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {selectedMembership.user?.email && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white">{selectedMembership.user.email}</span>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="pt-4 border-t border-primary-100">
                <label className="text-sm text-gray-400 mb-2 block">Update Status</label>
                <div className="flex gap-2">
                  {['pending', 'active', 'expired'].map(status => {
                    const config = getStatusConfig(status)
                    return (
                      <button
                        key={status}
                        onClick={() => { updateStatus(selectedMembership._id, status); setShowModal(false) }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedMembership.status === status
                            ? `${config.bg} ${config.text} border ${config.border}`
                            : 'bg-primary-200 text-gray-400 hover:text-white'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
