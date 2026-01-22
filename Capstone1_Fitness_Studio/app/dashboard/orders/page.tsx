'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaBox, FaTruck, FaCheckCircle, FaClock, FaCreditCard, FaMoneyBillWave, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';

type OrderStatus = 'pending' | 'shipping' | 'completed';

interface IOrder {
  _id: string;
  username: string;
  email: string;
  address: string;
  phone: string;
  items: {
    productId: string;
    name: string;
    url: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  payingMethod: 'cod' | 'credit';
  totalCartPrice: number;
  shippingFee: number;
  finalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      setLoading(false);
      return;
    }
    const userId = JSON.parse(user)._id;
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/order/get-orders/${userId}`, {
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

    fetchOrders();
  }, []);

  const groupedOrders = {
    pending: orders.filter(o => o.status === 'pending'),
    shipping: orders.filter(o => o.status === 'shipping'),
    completed: orders.filter(o => o.status === 'completed'),
  };

  // Calculate stats
  const orderStats = {
    total: orders.length,
    pending: groupedOrders.pending.length,
    shipping: groupedOrders.shipping.length,
    completed: groupedOrders.completed.length,
    totalSpent: orders.reduce((sum, order) => sum + order.finalPrice, 0),
  };

  // Get status color and icon
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-500',
          icon: <FaClock className="text-white" />,
          text: 'Pending',
          bgLight: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500',
        };
      case 'shipping':
        return {
          color: 'bg-blue-500',
          icon: <FaTruck className="text-white" />,
          text: 'Shipping',
          bgLight: 'bg-blue-500/10',
          borderColor: 'border-blue-500',
        };
      case 'completed':
        return {
          color: 'bg-green-500',
          icon: <FaCheckCircle className="text-white" />,
          text: 'Completed',
          bgLight: 'bg-green-500/10',
          borderColor: 'border-green-500',
        };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-primary-300 rounded-xl shadow-2xl p-12 border border-primary-100 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-300 to-primary-200 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaShoppingBag className="text-accent text-4xl" />
              <h1 className="text-4xl font-bold text-white">My Orders</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Track and manage your purchase history
            </p>
          </div>
          <div className="hidden md:block">
            <MdLocalShipping className="text-accent text-7xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <FaShoppingBag className="text-purple-400 text-3xl" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Orders</h3>
          <p className="text-white text-3xl font-bold">{orderStats.total}</p>
        </div>

        <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <FaClock className="text-yellow-400 text-3xl" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Pending</h3>
          <p className="text-white text-3xl font-bold">{orderStats.pending}</p>
        </div>

        <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <FaTruck className="text-blue-400 text-3xl" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Shipping</h3>
          <p className="text-white text-3xl font-bold">{orderStats.shipping}</p>
        </div>

        <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <FaCheckCircle className="text-green-400 text-3xl" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Completed</h3>
          <p className="text-white text-3xl font-bold">{orderStats.completed}</p>
        </div>
      </div>

      {/* Total Spent Card */}
      {orders.length > 0 && (
        <div className="bg-gradient-to-r from-accent to-accent/80 rounded-xl shadow-2xl p-6 border border-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Spent</p>
              <p className="text-white text-4xl font-bold">
                ${orderStats.totalSpent.toFixed(2)}
              </p>
            </div>
            <FaMoneyBillWave className="text-white text-5xl opacity-50" />
          </div>
        </div>
      )}

      {/* Orders by Status */}
      {(Object.keys(groupedOrders) as OrderStatus[]).map(status => {
        const statusConfig = getStatusConfig(status);
        
        return (
          <div key={status} className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${statusConfig.color}`}>
                  {statusConfig.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white capitalize">
                    {statusConfig.text} Orders
                  </h2>
                  <p className="text-gray-400">
                    {groupedOrders[status].length} order{groupedOrders[status].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-lg font-bold text-white ${statusConfig.color}`}>
                {groupedOrders[status].length}
              </span>
            </div>

            {groupedOrders[status].length === 0 ? (
              <div className="bg-primary-200 p-12 rounded-xl border-2 border-dashed border-primary-100 text-center">
                <FaBox className="text-gray-500 text-6xl mx-auto mb-4" />
                <p className="text-gray-400 text-xl">No {status} orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedOrders[status].map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-primary-200 rounded-xl border border-primary-100 p-6 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-primary-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statusConfig.color}`}>
                          <FaBox className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Order ID</p>
                          <p className="text-white font-bold text-sm">{order._id}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          {order.payingMethod === 'cod' ? (
                            <FaMoneyBillWave className="text-purple-400 text-xl" />
                          ) : (
                            <FaCreditCard className="text-purple-400 text-xl" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Payment Method</p>
                          <p className="text-white font-bold text-sm uppercase">
                            {order.payingMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
                          </p>
                        </div>
                      </div>

                      <div className={`px-6 py-3 rounded-xl ${statusConfig.color} shadow-lg`}>
                        <p className="text-white font-bold text-2xl">
                          ${order.finalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-primary-300 rounded-lg p-5 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FaMapMarkerAlt className="text-accent text-lg" />
                        <h3 className="text-white font-bold">Shipping Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <FaUser className="text-blue-400" />
                          <div>
                            <p className="text-gray-400 text-xs">Name</p>
                            <p className="text-white font-medium">{order.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaEnvelope className="text-green-400" />
                          <div>
                            <p className="text-gray-400 text-xs">Email</p>
                            <p className="text-white font-medium text-sm">{order.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaPhone className="text-yellow-400" />
                          <div>
                            <p className="text-gray-400 text-xs">Phone</p>
                            <p className="text-white font-medium">{order.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-primary-100">
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-accent text-lg mt-1" />
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Delivery Address</p>
                            <p className="text-white font-medium">{order.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FaShoppingBag className="text-accent" />
                        Order Items
                      </h3>
                      <div className="space-y-3">
                        {order.items.map(item => (
                          <div
                            key={item.productId}
                            className="flex gap-4 items-center bg-primary-300 rounded-lg p-4 hover:bg-primary-100 transition-all"
                          >
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0 shadow-md">
                              <Image
                                src={item.url}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1">
                              <p className="text-white font-bold text-lg">{item.name}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-gray-400 text-sm">
                                  Qty: <span className="text-white font-semibold">{item.quantity}</span>
                                </span>
                                <span className="text-gray-400 text-sm">
                                  Price: <span className="text-white font-semibold">${item.price.toFixed(2)}</span>
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-gray-400 text-xs mb-1">Total</p>
                              <p className="text-accent font-bold text-xl">
                                ${item.totalPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-primary-300 rounded-lg p-5">
                      <h3 className="text-white font-bold mb-4">Price Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-white font-semibold">
                            ${order.totalCartPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Shipping Fee</span>
                          <span className="text-white font-semibold">
                            ${order.shippingFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-primary-100">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold text-lg">Final Total</span>
                            <span className="text-accent font-bold text-2xl">
                              ${order.finalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Empty State - No Orders at All */}
      {orders.length === 0 && (
        <div className="bg-primary-300 rounded-xl shadow-2xl p-12 border border-primary-100 text-center">
          <FaShoppingBag className="text-gray-500 text-7xl mx-auto mb-6" />
          <h3 className="text-white text-2xl font-bold mb-2">No Orders Yet</h3>
          <p className="text-gray-400 text-lg mb-6">
            Start shopping to see your orders here!
          </p>
          <a
            href="/shopping"
            className="inline-block bg-accent hover:bg-accent/80 text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Browse Products
          </a>
        </div>
      )}
    </div>
  );
}
