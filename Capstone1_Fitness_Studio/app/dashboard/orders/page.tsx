'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {(Object.keys(groupedOrders) as OrderStatus[]).map(status => (
          <section key={status} className="mb-12">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {status} Orders ({groupedOrders[status].length})
            </h2>

            {groupedOrders[status].length === 0 ? (
              <p className="text-gray-500 italic">No orders</p>
            ) : (
              <div className="space-y-6">
                {groupedOrders[status].map(order => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-6"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-semibold">{order._id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment</p>
                        <p className="font-semibold uppercase">
                          {order.payingMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-accent">
                          ${order.finalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="font-semibold">{order.username}</p>
                      <p className="text-sm text-gray-600">{order.email}</p>
                      <p className="text-sm text-gray-600">{order.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.address}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div
                          key={item.productId}
                          className="flex gap-4 items-center border-b pb-3 last:border-b-0"
                        >
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                            <Image
                              src={item.url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <div className="font-semibold text-accent">
                            ${item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${order.totalCartPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>${order.shippingFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>Final Total</span>
                        <span>${order.finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
