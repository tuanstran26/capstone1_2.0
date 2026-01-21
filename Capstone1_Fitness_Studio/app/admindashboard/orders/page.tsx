'use client';

import { useEffect, useState } from 'react';
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiDollarSign, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiCreditCard,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiShoppingBag,
  FiCalendar,
  FiRefreshCw,
  FiEye
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type OrderStatus = 'pending' | 'shipping' | 'completed';

interface IOrder {
  _id: string;
  userId: string;
  username: string;
  email: string;
  address: string;
  phone: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  payingMethod: 'cod' | 'credit';
  totalCartPrice: number;
  shippingFee: number;
  finalPrice: number;
  status: OrderStatus;
  createdAt?: string;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    icon: FiClock
  },
  shipping: {
    label: 'Shipping',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    icon: FiTruck
  },
  completed: {
    label: 'Completed',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    icon: FiCheckCircle
  }
};

const PIE_COLORS = ['#EAB308', '#3B82F6', '#22C55E'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/order/all-orders', {
        credentials: 'include',
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await fetch(`http://localhost:5000/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.finalPrice, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    shippingOrders: orders.filter(o => o.status === 'shipping').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.finalPrice, 0) / orders.length : 0
  };

  // Pie chart data
  const pieData = [
    { name: 'Pending', value: stats.pendingOrders },
    { name: 'Shipping', value: stats.shippingOrders },
    { name: 'Completed', value: stats.completedOrders }
  ];

  // Daily orders data (last 7 days)
  const getDailyOrders = () => {
    const days: { [key: string]: number } = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('en-US', { weekday: 'short' });
      days[key] = 0;
    }
    
    orders.forEach(order => {
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 6) {
          const key = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (days[key] !== undefined) {
            days[key]++;
          }
        }
      }
    });
    
    return Object.entries(days).map(([name, orders]) => ({ name, orders }));
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payingMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiPackage className="text-accent" />
            Order Management
          </h1>
          <p className="text-gray-400 mt-1">Track and manage all customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-xl transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-5 border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-xl">
              <FiShoppingBag className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl p-5 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <FiDollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-2xl p-5 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-xl">
              <FiClock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <FiTruck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Shipping</p>
              <p className="text-2xl font-bold text-white">{stats.shippingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders Bar Chart */}
        <div className="lg:col-span-2 bg-primary-300 rounded-2xl p-6 border border-primary-100">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiCalendar className="text-accent" />
            Orders This Week
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDailyOrders()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="orders" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-primary-300 rounded-2xl p-6 border border-primary-100">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                <span className="text-xs text-gray-400">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-primary-300 rounded-2xl p-4 mb-6 border border-primary-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, email, or order ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder-gray-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | 'all');
                setCurrentPage(1);
              }}
              className="pl-11 pr-8 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="shipping">Shipping</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="relative">
            <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-11 pr-8 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none min-w-[150px]"
            >
              <option value="all">All Payment</option>
              <option value="cod">COD</option>
              <option value="credit">Credit Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400">
          Showing <span className="text-white font-medium">{paginatedOrders.length}</span> of{' '}
          <span className="text-white font-medium">{filteredOrders.length}</span> orders
        </p>
        <p className="text-sm text-gray-500">
          Avg. Order Value: <span className="text-accent font-medium">${stats.averageOrderValue.toFixed(2)}</span>
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {paginatedOrders.length === 0 ? (
          <div className="bg-primary-300 rounded-2xl p-12 text-center border border-primary-100">
            <FiPackage className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          paginatedOrders.map(order => {
            const StatusIcon = STATUS_CONFIG[order.status].icon;
            const isExpanded = expandedOrder === order._id;
            
            return (
              <div
                key={order._id}
                className="bg-primary-300 rounded-2xl border border-primary-100 overflow-hidden transition-all hover:border-primary-100/80"
              >
                {/* Order Header */}
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Order Info */}
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${STATUS_CONFIG[order.status].bgColor}`}>
                        <StatusIcon className={`w-6 h-6 ${STATUS_CONFIG[order.status].color}`} />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-white font-medium">{order.username}</p>
                        <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    {/* Center: Items Count & Total */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Items</p>
                        <p className="text-lg font-semibold text-white">{order.items.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Total</p>
                        <p className="text-lg font-semibold text-green-400">${order.finalPrice.toFixed(2)}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-2">
                        {order.payingMethod === 'cod' ? (
                          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                            COD
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                            Credit Card
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Status & Expand */}
                    <div className="flex items-center gap-3">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateStatus(order._id, e.target.value as OrderStatus);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${STATUS_CONFIG[order.status].bgColor} ${STATUS_CONFIG[order.status].borderColor} ${STATUS_CONFIG[order.status].color}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipping">Shipping</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="p-2 hover:bg-primary-200 rounded-lg transition-colors text-gray-400 hover:text-white"
                        title="View Details"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      {isExpanded ? (
                        <FiChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-primary-100 p-5 bg-primary-200/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Customer Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white">
                            <FiUser className="w-4 h-4 text-gray-500" />
                            {order.username}
                          </div>
                          <div className="flex items-center gap-2 text-white">
                            <FiMail className="w-4 h-4 text-gray-500" />
                            {order.email}
                          </div>
                          <div className="flex items-center gap-2 text-white">
                            <FiPhone className="w-4 h-4 text-gray-500" />
                            {order.phone || 'N/A'}
                          </div>
                          <div className="flex items-start gap-2 text-white">
                            <FiMapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            {order.address || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Order Items</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-white">
                                {item.name} <span className="text-gray-400">× {item.quantity}</span>
                              </span>
                              <span className="text-gray-300">${item.totalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-primary-100 mt-3 pt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="text-white">${order.totalCartPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Shipping</span>
                            <span className="text-white">${order.shippingFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-white">Total</span>
                            <span className="text-green-400">${order.finalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-primary-300 border border-primary-100 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-200 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-accent text-white'
                      : 'bg-primary-300 border border-primary-100 text-gray-400 hover:text-white hover:bg-primary-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-primary-300 border border-primary-100 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-200 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-primary-300 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primary-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-primary-300 p-6 border-b border-primary-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <p className="text-sm text-gray-400">#{selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-primary-200 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${STATUS_CONFIG[selectedOrder.status].bgColor} ${STATUS_CONFIG[selectedOrder.status].borderColor} border`}>
                  {(() => {
                    const Icon = STATUS_CONFIG[selectedOrder.status].icon;
                    return <Icon className={`w-5 h-5 ${STATUS_CONFIG[selectedOrder.status].color}`} />;
                  })()}
                  <span className={`font-medium ${STATUS_CONFIG[selectedOrder.status].color}`}>
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-primary-200/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Customer</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-accent" />
                    <span className="text-white">{selectedOrder.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-accent" />
                    <span className="text-white">{selectedOrder.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4 text-accent" />
                    <span className="text-white">{selectedOrder.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="w-4 h-4 text-accent" />
                    <span className="text-white">{selectedOrder.payingMethod.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <FiMapPin className="w-4 h-4 text-accent mt-0.5" />
                  <span className="text-white">{selectedOrder.address || 'No address provided'}</span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Items ({selectedOrder.items.length})</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-primary-200/50 rounded-xl">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-sm text-gray-400">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-white font-medium">${item.totalPrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${selectedOrder.totalCartPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping Fee</span>
                    <span className="text-white">${selectedOrder.shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-accent/20 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-lg font-bold text-accent">${selectedOrder.finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
