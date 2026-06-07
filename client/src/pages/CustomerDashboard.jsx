import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my/orders');
        setOrders(res.data.orders);
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
      case 'Accepted': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
      case 'Preparing': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400';
      case 'Ready': return 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand';
      case 'Out_For_Delivery': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
      default: return 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-brand mb-4" />
        <span>Loading dashboard details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{t('orders')}</h1>
        <p className="text-slate-500 text-sm mt-1">Manage and track your food orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No orders found</h3>
          <p className="text-sm">You haven't placed any food orders yet.</p>
          <Link 
            to="/menu" 
            className="mt-4 inline-flex items-center gap-1 bg-brand text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            <span>Browse Food Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-400 text-2xs uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Restaurant</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {order._id.toString().substring(0, 10)}...
                    </td>
                    <td className="px-6 py-4">
                      {order.restaurant?.name || 'Restaurant'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-black">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/order-tracking/${order._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand/10 hover:text-brand text-xs rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
