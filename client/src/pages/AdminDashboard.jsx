import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, 
  Store, 
  Truck, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Ticket, 
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  Eye
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api.js';

const COLORS = ['#059669', '#3b82f6', '#d97706', '#8b5cf6', '#ec4899', '#f43f5e'];

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/users')) return 'users';
    if (path.endsWith('/restaurants')) return 'restaurants';
    if (path.endsWith('/drivers')) return 'drivers';
    if (path.endsWith('/orders')) return 'orders';
    if (path.endsWith('/coupons')) return 'coupons';
    if (path.endsWith('/reports')) return 'reports';
    return 'analytics';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId) => {
    if (tabId === 'analytics') navigate('/admin');
    else navigate(`/admin/${tabId}`);
  };

  const [loading, setLoading] = useState(true);

  // Form hooks for creating coupon
  const { register, handleSubmit, reset } = useForm();

  const loadAdminData = async () => {
    try {
      // 1. Load analytics and charts
      const analyticsRes = await api.get('/analytics/dashboard');
      setStats(analyticsRes.data.stats);
      setCharts(analyticsRes.data.charts);

      // 2. Load users
      const usersRes = await api.get('/auth/users');
      setUsersList(usersRes.data.users);

      // 3. Load restaurants
      const restRes = await api.get('/restaurants');
      setRestaurantsList(restRes.data.restaurants);

      // 4. Load coupons
      const coupRes = await api.get('/coupons');
      setCouponsList(coupRes.data.coupons);

      // 5. Load orders
      const ordersRes = await api.get('/orders/my/orders');
      setOrdersList(ordersRes.data.orders);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Update user role or ban status
  const handleUpdateUser = async (userId, payload) => {
    try {
      await api.put(`/auth/users/${userId}`, payload);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Toggle restaurant active status
  const handleToggleRestaurant = async (restId, currentStatus) => {
    try {
      await api.put(`/restaurants/${restId}`, {
        isActive: !currentStatus
      });
      loadAdminData();
    } catch (err) {
      alert('Failed to toggle restaurant status');
    }
  };

  // Delete restaurant
  const handleDeleteRestaurant = async (restId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await api.delete(`/restaurants/${restId}`);
      loadAdminData();
    } catch (err) {
      alert('Failed to delete restaurant');
    }
  };

  // Create coupon
  const handleCreateCoupon = async (data) => {
    try {
      await api.post('/coupons', {
        code: data.code,
        discountPercentage: data.discountPercentage,
        expiryDate: data.expiryDate,
        usageLimit: data.usageLimit || 100
      });
      reset();
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (coupId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${coupId}`);
      loadAdminData();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  // Trigger report downloads (streams buffer to window location)
  const triggerReportDownload = (reportType, format) => {
    const token = localStorage.getItem('accessToken');
    const url = `http://localhost:5000/api/analytics/reports/${reportType}?format=${format}&token=${token}`;
    
    // Simulates secure file query
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <span>Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">System Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Manage global operations, users, restaurants, coupons, and view reports.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'users', label: 'Customers & Roles' },
            { id: 'restaurants', label: 'Restaurants' },
            { id: 'drivers', label: 'Drivers' },
            { id: 'orders', label: 'Orders' },
            { id: 'coupons', label: 'Coupons' },
            { id: 'reports', label: 'Reports Export' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === tab.id ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-4xs text-slate-400 font-extrabold uppercase">Total Revenue</span>
            <span className="text-lg font-black text-emerald-500">${stats?.totalRevenue.toFixed(2)}</span>
          </div>
          <div className="p-2 bg-emerald-500/15 text-emerald-500 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-4xs text-slate-400 font-extrabold uppercase">Total Orders</span>
            <span className="text-lg font-black">{stats?.totalOrders}</span>
          </div>
          <div className="p-2 bg-brand/15 text-brand rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-4xs text-slate-400 font-extrabold uppercase">Customers</span>
            <span className="text-lg font-black text-blue-500">{stats?.totalUsers}</span>
          </div>
          <div className="p-2 bg-blue-500/15 text-blue-500 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-4xs text-slate-400 font-extrabold uppercase">Restaurants</span>
            <span className="text-lg font-black text-amber-500">{stats?.totalRestaurants}</span>
          </div>
          <div className="p-2 bg-amber-500/15 text-amber-500 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-4xs text-slate-400 font-extrabold uppercase">Drivers</span>
            <span className="text-lg font-black text-purple-500">{stats?.totalDrivers}</span>
          </div>
          <div className="p-2 bg-purple-500/15 text-purple-500 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics View */}
      {activeTab === 'analytics' && charts && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Line */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wide">Daily Sales Trend (Paid Orders)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Sales Bar */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wide">Monthly Revenue Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Categories Pie Distribution */}
          <div className="glass-card p-5 max-w-xl mx-auto space-y-4">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wide text-center">Menu Dishes Count by Category</h3>
            <div className="h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Pie Legends */}
              <div className="flex flex-col gap-1.5 text-xs text-left max-h-48 overflow-y-auto">
                {charts.categoryDistribution.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users management tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">System Account Directory</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-400 text-2xs uppercase tracking-wider">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {usersList.map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="px-6 py-4">{usr.fullName}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{usr.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={usr.role}
                          onChange={(e) => handleUpdateUser(usr._id, { role: e.target.value })}
                          disabled={usr._id === user.id} // Don't self-demote
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                        >
                          <option value="customer">Customer</option>
                          <option value="restaurant_manager">Manager</option>
                          <option value="driver">Driver</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {usr.isActive ? (
                          <span className="text-emerald-500 text-xs flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Active</span>
                        ) : (
                          <span className="text-rose-500 text-xs flex items-center gap-1"><XCircle className="w-4 h-4" /> Banned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateUser(usr._id, { isActive: !usr.isActive })}
                          disabled={usr._id === user.id}
                          className={`p-1.5 rounded-lg transition text-xs font-bold ${
                            usr.isActive 
                              ? 'bg-slate-100 text-rose-500 hover:bg-rose-50' 
                              : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
                          }`}
                        >
                          {usr.isActive ? 'Ban Account' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          disabled={usr._id === user.id}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-500 text-slate-500 rounded-lg transition"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Restaurants management tab */}
      {activeTab === 'restaurants' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">Restaurant Directories</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-400 text-2xs uppercase tracking-wider">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Cuisine</th>
                    <th className="px-6 py-4">Manager Owner</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {restaurantsList.map((rest) => (
                    <tr key={rest._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="px-6 py-4">{rest.name}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{rest.cuisine}</td>
                      <td className="px-6 py-4 text-xs">{rest.owner?.fullName || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {rest.isActive ? (
                          <span className="text-emerald-500 text-xs flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Open</span>
                        ) : (
                          <span className="text-rose-500 text-xs flex items-center gap-1"><XCircle className="w-4 h-4" /> Closed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleRestaurant(rest._id, rest.isActive)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition ${
                            rest.isActive 
                              ? 'bg-slate-100 text-rose-500 hover:bg-rose-50' 
                              : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
                          }`}
                        >
                          {rest.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteRestaurant(rest._id)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-500 text-slate-500 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Drivers management tab */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">Platform Drivers Directory</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-400 text-2xs uppercase tracking-wider">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {usersList.filter(u => u.role === 'driver').map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="px-6 py-4">{usr.fullName}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{usr.email}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{usr.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {usr.isActive ? (
                          <span className="text-emerald-500 text-xs flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Active</span>
                        ) : (
                          <span className="text-rose-500 text-xs flex items-center gap-1"><XCircle className="w-4 h-4" /> Banned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateUser(usr._id, { isActive: !usr.isActive })}
                          className={`p-1.5 rounded-lg transition text-xs font-bold ${
                            usr.isActive 
                              ? 'bg-slate-100 text-rose-500 hover:bg-rose-50' 
                              : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
                          }`}
                        >
                          {usr.isActive ? 'Ban Driver' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-500 text-slate-500 rounded-lg transition"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersList.filter(u => u.role === 'driver').length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        No drivers registered in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders management tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">System Order Ledger</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-400 text-2xs uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Restaurant</th>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {ordersList.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {order._id.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold">{order.customer?.fullName || 'N/A'}</div>
                        <div className="text-4xs text-slate-400 font-mono">{order.customer?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {order.restaurant?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {order.driver?.fullName ? (
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{order.driver.fullName}</span>
                        ) : (
                          <span className="text-slate-400 text-2xs font-extrabold uppercase italic">Unassigned</span>
                        )}
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
                        <button
                          onClick={() => navigate(`/order-tracking/${order._id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand/10 hover:text-brand text-xs rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ordersList.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                        No orders recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create coupon */}
          <div className="glass-card p-6 h-fit space-y-4">
            <h3 className="font-black text-lg border-b border-slate-200/50 dark:border-slate-800/40 pb-3 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-brand" /> Create Promo Coupon
            </h3>

            <form onSubmit={handleSubmit(handleCreateCoupon)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="WELCOME30"
                  {...register('code')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none uppercase font-mono tracking-wider focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Discount (%)</label>
                <input
                  type="number"
                  required
                  placeholder="30"
                  {...register('discountPercentage')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Usage Limit</label>
                <input
                  type="number"
                  defaultValue={200}
                  {...register('usageLimit')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  {...register('expiryDate')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none text-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand text-white font-bold rounded-xl text-xs hover:bg-brand-700 transition"
              >
                Publish Coupon
              </button>
            </form>
          </div>

          {/* Coupons list */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-black tracking-tight">Active Promo Coupons</h2>
            {couponsList.length === 0 ? (
              <p className="text-slate-500 text-sm">No coupons created yet.</p>
            ) : (
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-400 text-2xs uppercase tracking-wider">
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Discount</th>
                      <th className="px-6 py-4">Uses / Limit</th>
                      <th className="px-6 py-4">Expiry</th>
                      <th className="px-6 py-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                    {couponsList.map((coup) => (
                      <tr key={coup._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                        <td className="px-6 py-4 font-mono font-black text-xs text-brand tracking-wider uppercase">{coup.code}</td>
                        <td className="px-6 py-4 text-emerald-500">{coup.discountPercentage}% OFF</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{coup.usageCount} / {coup.usageLimit}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(coup.expiryDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(coup._id)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-500 text-slate-500 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">Administrative Reports Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sales */}
            <div className="glass-card p-6 text-center space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base">Sales & Revenue Audit</h3>
                <p className="text-xs text-slate-400">Generates comprehensive report of all financial receipts, payment types, and revenue aggregates.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => triggerReportDownload('sales', 'pdf')}
                  className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  onClick={() => triggerReportDownload('sales', 'excel')}
                  className="flex-1 py-2 bg-brand text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-brand-700 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </button>
              </div>
            </div>

            {/* Customers */}
            <div className="glass-card p-6 text-center space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-amber-500/10 text-accent rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base">Customers Database</h3>
                <p className="text-xs text-slate-400">Generates detailed profiles list of registered platform clients, phone grids, and join timestamps.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => triggerReportDownload('customers', 'pdf')}
                  className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  onClick={() => triggerReportDownload('customers', 'excel')}
                  className="flex-1 py-2 bg-brand text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-brand-700 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </button>
              </div>
            </div>

            {/* Orders */}
            <div className="glass-card p-6 text-center space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base">Operations & Deliveries</h3>
                <p className="text-xs text-slate-400">Generates detailed ledger of orders tracking driver completions, statuses, and delivery fees.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => triggerReportDownload('orders', 'pdf')}
                  className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  onClick={() => triggerReportDownload('orders', 'excel')}
                  className="flex-1 py-2 bg-brand text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-brand-700 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
