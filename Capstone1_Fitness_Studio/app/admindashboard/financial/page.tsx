'use client'

import { useState, useEffect } from 'react'
import { 
  FiDollarSign, 
  FiFilter,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiSearch,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck
} from 'react-icons/fi'

interface OrderItem {
  productId: string;
  name: string;
  url: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  _id: string;
  userId: string;
  username: string;
  email: string;
  address: string;
  phone: string;
  items: OrderItem[];
  payingMethod: 'cod' | 'credit';
  totalCartPrice: number;
  shippingFee: number;
  finalPrice: number;
  status: 'pending' | 'shipping' | 'completed';
  createdAt: string;
  updatedAt: string;
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

export default function FinancialPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [ordersRes, membershipsRes] = await Promise.all([
          fetch('http://localhost:5000/order/all-orders', { credentials: 'include' }),
          fetch('http://localhost:5000/admin/memberships', { credentials: 'include' })
        ])
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setOrders(ordersData.orders || [])
        }
        
        if (membershipsRes.ok) {
          const membershipsData = await membershipsRes.json()
          setMemberships(membershipsData || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Calculate revenue from orders
  const totalOrderRevenue = orders.reduce((sum, order) => sum + order.finalPrice, 0)
  const completedOrderRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.finalPrice, 0)
  const pendingOrderRevenue = orders
    .filter(o => o.status === 'pending')
    .reduce((sum, order) => sum + order.finalPrice, 0)
  
  // Calculate revenue from memberships
  const totalMembershipRevenue = memberships
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.price, 0)
  
  // Combined revenue
  const totalRevenue = completedOrderRevenue + totalMembershipRevenue
  
  // Order stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    completed: orders.filter(o => o.status === 'completed').length
  }
  
  // Filter orders for transaction list
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-yellow-400" />
      case 'shipping':
        return <FiTruck className="text-blue-400" />
      case 'completed':
        return <FiCheckCircle className="text-green-400" />
      default:
        return null
    }
  }
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
      case 'shipping':
        return 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
      case 'completed':
        return 'bg-green-900/30 text-green-400 border border-green-500/30'
      default:
        return 'bg-gray-700 text-gray-300'
    }
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
      <div className="bg-gradient-to-r from-green-900/50 to-primary-200 rounded-xl p-6 border border-green-500/20">
        <div className="flex items-center gap-4">
          <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/30">
            <FiDollarSign className="text-3xl text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Financial Management</h1>
            <p className="text-gray-400">Track revenue from orders and memberships</p>
          </div>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-900/40 to-primary-300 rounded-xl p-5 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <FiDollarSign className="text-green-400 text-xl" />
            </div>
            <span className="text-gray-400 text-sm">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">From completed orders & memberships</p>
        </div>
        
        {/* Order Revenue */}
        <div className="bg-gradient-to-br from-blue-900/40 to-primary-300 rounded-xl p-5 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <FiShoppingBag className="text-blue-400 text-xl" />
            </div>
            <span className="text-gray-400 text-sm">Product Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(completedOrderRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">From {orderStats.completed} completed orders</p>
        </div>
        
        {/* Membership Revenue */}
        <div className="bg-gradient-to-br from-purple-900/40 to-primary-300 rounded-xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <FiUsers className="text-purple-400 text-xl" />
            </div>
            <span className="text-gray-400 text-sm">Membership Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalMembershipRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">From {memberships.filter(m => m.status === 'completed').length} active memberships</p>
        </div>
        
        {/* Pending Revenue */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-primary-300 rounded-xl p-5 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <FiTrendingUp className="text-yellow-400 text-xl" />
            </div>
            <span className="text-gray-400 text-sm">Pending Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(pendingOrderRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">From {orderStats.pending} pending orders</p>
        </div>
      </div>
      
      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-primary-300 rounded-xl p-4 border border-primary-100 flex items-center gap-4">
          <div className="bg-primary-200 p-3 rounded-lg">
            <FiPackage className="text-accent text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{orderStats.total}</p>
            <p className="text-sm text-gray-400">Total Orders</p>
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-xl p-4 border border-primary-100 flex items-center gap-4">
          <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/30">
            <FiClock className="text-yellow-400 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{orderStats.pending}</p>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-xl p-4 border border-primary-100 flex items-center gap-4">
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
            <FiTruck className="text-blue-400 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{orderStats.shipping}</p>
            <p className="text-sm text-gray-400">Shipping</p>
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-xl p-4 border border-primary-100 flex items-center gap-4">
          <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
            <FiCheckCircle className="text-green-400 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{orderStats.completed}</p>
            <p className="text-sm text-gray-400">Completed</p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Breakdown */}
        <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiUsers className="text-purple-400" />
            Membership Revenue Breakdown
          </h2>
          <div className="space-y-4">
            {['Standard', 'Premium', 'Elite'].map(plan => {
              const planMemberships = memberships.filter(m => m.name === plan && m.status === 'completed')
              const planRevenue = planMemberships.reduce((sum, m) => sum + m.price, 0)
              const percentage = totalMembershipRevenue > 0 ? (planRevenue / totalMembershipRevenue) * 100 : 0
              
              return (
                <div key={plan} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{plan} Plan</span>
                    <span className="text-white font-medium">{formatCurrency(planRevenue)}</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        plan === 'Elite' ? 'bg-yellow-500' :
                        plan === 'Premium' ? 'bg-purple-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{planMemberships.length} members • {percentage.toFixed(1)}%</p>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Recent Memberships */}
        <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-green-400" />
            Recent Memberships
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {memberships.slice(0, 10).map(membership => (
              <div key={membership._id} className="bg-primary-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{membership.username}</p>
                  <p className="text-gray-400 text-xs">{membership.name} Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium text-sm">{formatCurrency(membership.price)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                    membership.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {membership.status}
                  </span>
                </div>
              </div>
            ))}
            {memberships.length === 0 && (
              <p className="text-gray-400 text-center py-4">No memberships found</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiShoppingBag className="text-blue-400" />
            Order Transactions
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 bg-primary-200 border border-primary-100 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                className="bg-primary-200 border border-primary-100 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="shipping">Shipping</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Items</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-b border-primary-100/50 hover:bg-primary-200/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-accent">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-white font-medium">{order.username}</p>
                    <p className="text-xs text-gray-400">{order.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">{order.items.length} item(s)</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.payingMethod === 'credit' 
                        ? 'bg-blue-900/30 text-blue-400' 
                        : 'bg-orange-900/30 text-orange-400'
                    }`}>
                      {order.payingMethod === 'credit' ? 'Credit Card' : 'COD'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {getStatusIcon(order.status)}
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
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <FiShoppingBag className="text-4xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No orders found</p>
          </div>
        )}
        
        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary-100 flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <p className="text-sm text-gray-400">
              Filtered Total: <span className="text-white font-bold">
                {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.finalPrice, 0))}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
