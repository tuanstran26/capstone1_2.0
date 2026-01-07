'use client';

import { useEffect, useState } from 'react';

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">📦 Order Management</h1>

      <div className="space-y-6">
        {orders.map(order => (
          <div
            key={order._id}
            className="border border-gray-800 rounded-xl p-6 bg-gray-900"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-400">Order ID</p>
                <p className="font-mono text-sm">{order._id}</p>
              </div>

              <select
                value={order.status}
                onChange={e =>
                  updateStatus(order._id, e.target.value as OrderStatus)
                }
                className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="shipping">Shipping</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-400">Customer</p>
                <p>{order.username}</p>
                <p>{order.email}</p>
                <p>{order.phone}</p>
              </div>
              <div>
                <p className="text-gray-400">Address</p>
                <p>{order.address}</p>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-400 text-sm mb-2">
                Items ({order.items.length})
              </p>
              <div className="space-y-1 text-sm">
                {order.items.map(item => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-gray-300"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-800 pt-4 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cart Total</span>
                <span>${order.totalCartPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span>${order.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-2">
                <span>Total</span>
                <span className="text-green-400">
                  ${order.finalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Payment: {order.payingMethod.toUpperCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
