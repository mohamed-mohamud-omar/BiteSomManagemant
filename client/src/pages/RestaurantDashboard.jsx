import React, { useEffect, useState } from 'react';
import { ChefHat, ShoppingBag, Plus, Trash2, Edit2, CheckCircle2, XCircle, Clock, ToggleLeft, ToggleRight, FileImage } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settingsData, setSettingsData] = useState({
    name: '',
    description: '',
    address: '',
    cuisine: '',
    deliveryTime: '',
    deliveryFee: 0,
    logo: ''
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/foods')) return 'menu';
    if (path.endsWith('/settings')) return 'settings';
    return 'orders';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId) => {
    if (tabId === 'menu') navigate('/restaurant/foods');
    else if (tabId === 'settings') navigate('/restaurant/settings');
    else navigate('/restaurant');
  };

  const [loading, setLoading] = useState(true);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editFoodItem, setEditFoodItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      // 1. Get my restaurant
      const restRes = await api.get('/restaurants/my/restaurant');
      const rest = restRes.data.restaurant;
      setRestaurant(rest);
      if (rest) {
        setSettingsData({
          name: rest.name || '',
          description: rest.description || '',
          address: rest.address || '',
          cuisine: rest.cuisine || '',
          deliveryTime: rest.deliveryTime || '',
          deliveryFee: rest.deliveryFee || 0,
          logo: rest.logo || ''
        });
      }
      const restId = rest?._id;

      // 2. Get categories
      const catRes = await api.get('/categories');
      setCategories(catRes.data.categories);

      // 3. Get foods for this restaurant (including unavailable ones for management)
      if (restId) {
        const foodRes = await api.get(`/foods?restaurant=${restId}&limit=100&showAll=true`);
        setFoods(foodRes.data.foods);
      }

      // 4. Get orders for this restaurant
      const orderRes = await api.get('/orders/my/orders');
      setOrders(orderRes.data.orders);
    } catch (err) {
      console.error('Error fetching manager dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update order status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Reload orders list
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Toggle food availability
  const handleToggleAvailability = async (food) => {
    try {
      await api.put(`/foods/${food._id}`, {
        availability: !food.availability
      });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  // Delete food item
  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/foods/${foodId}`);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete food');
    }
  };

  // Handle Add/Edit Food submit
  const handleFoodSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('availability', data.availability);
    formData.append('discountPercentage', data.discountPercentage || 0);
    formData.append('restaurant', restaurant._id);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editFoodItem) {
        await api.put(`/foods/${editFoodItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/foods', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setFoodModalOpen(false);
      setEditFoodItem(null);
      setImageFile(null);
      reset();
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save food item');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await api.put(`/restaurants/${restaurant._id}`, settingsData);
      setRestaurant(res.data.restaurant);
      alert('Restaurant settings updated successfully!');
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const openEditModal = (food) => {
    setEditFoodItem(food);
    setValue('name', food.name);
    setValue('description', food.description);
    setValue('price', food.price);
    setValue('category', food.category?._id || food.category);
    setValue('availability', food.availability);
    setValue('discountPercentage', food.discountPercentage);
    setFoodModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-500';
      case 'Accepted': return 'text-blue-500';
      case 'Preparing': return 'text-purple-500';
      case 'Ready': return 'text-emerald-500';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-brand mb-4" />
        <span>Loading restaurant dashboard...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500 space-y-4">
        <h1 className="text-xl font-bold">You do not manage a restaurant yet.</h1>
        <p className="text-sm">Please ask a system administrator to register your restaurant and assign it to you.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Rest info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{restaurant.name}</h1>
          <p className="text-slate-500 text-sm mt-1">{restaurant.cuisine} Cuisine • {restaurant.address}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { handleTabClick('orders'); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'orders' ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => { handleTabClick('menu'); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'menu' ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Manage Menu ({foods.length})
          </button>
          <button
            onClick={() => { handleTabClick('settings'); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'settings' ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Stats summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="block text-2xs text-slate-400 font-extrabold uppercase">Total Orders</span>
            <span className="text-2xl font-black">{orders.length}</span>
          </div>
          <div className="p-3 bg-brand/10 text-brand rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="block text-2xs text-slate-400 font-extrabold uppercase">Pending Approvals</span>
            <span className="text-2xl font-black text-amber-500">
              {orders.filter(o => o.status === 'Pending').length}
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="block text-2xs text-slate-400 font-extrabold uppercase">Active Menu Foods</span>
            <span className="text-2xl font-black text-brand">
              {foods.filter(f => f.availability).length}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Content tabs */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">Active Orders Queue</h2>
          {orders.length === 0 ? (
            <p className="text-slate-500 text-sm">No orders received yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((order) => (
                <div key={order._id} className="glass-card p-5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-mono text-xs text-slate-500">ID: {order._id.toString().substring(0, 10)}...</span>
                    <span className={`text-xs font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1.5 text-sm">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.food?.name || 'Dish'} <span className="text-xs font-black text-brand">x{item.quantity}</span></span>
                        <span className="font-bold text-slate-500">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-base font-black pt-2 border-t border-slate-100 dark:border-slate-800/40">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Address and details */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <p><span className="font-bold text-slate-400">Customer:</span> {order.deliveryAddress.fullName} ({order.deliveryAddress.phone})</p>
                    <p><span className="font-bold text-slate-400">Address:</span> {order.deliveryAddress.address}, {order.deliveryAddress.city}</p>
                    {order.deliveryNotes && <p><span className="font-bold text-slate-400">Notes:</span> {order.deliveryNotes}</p>}
                  </div>

                  {/* Flow buttons */}
                  <div className="flex gap-2">
                    {order.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleOrderStatusUpdate(order._id, 'Accepted')}
                          className="flex-1 py-2 bg-brand hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleOrderStatusUpdate(order._id, 'Cancelled')}
                          className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {order.status === 'Accepted' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(order._id, 'Preparing')}
                        className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs transition"
                      >
                        Start Preparing (Cook)
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(order._id, 'Ready')}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition"
                      >
                        Mark Ready for Driver Pickup
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <span className="w-full text-center text-slate-400 text-xs font-semibold py-2">
                        Awaiting Driver Collection
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        /* MENU Tab content */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight">Dish Catalog</h2>
            <button
              onClick={() => { setEditFoodItem(null); reset(); setFoodModalOpen(true); }}
              className="px-4 py-2 bg-brand text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow hover:bg-brand-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Food Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <div key={food._id} className="glass-card overflow-hidden flex flex-col justify-between">
                {/* Image & details */}
                <div className="h-44 bg-slate-100 dark:bg-slate-900 relative">
                  <img
                    src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleToggleAvailability(food)}
                    className="absolute top-3 right-3 p-1.5 bg-white dark:bg-slate-950 rounded-lg shadow"
                    title="Toggle Stock Availability"
                  >
                    {food.availability ? (
                      <ToggleRight className="w-6 h-6 text-brand" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Body info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm leading-snug">{food.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{food.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-black text-sm">${food.price.toFixed(2)}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditModal(food)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand/10 hover:text-brand text-slate-500 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFood(food._id)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-500 text-slate-500 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab content */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="glass-card p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black tracking-tight">Restaurant Settings</h2>
              <p className="text-slate-500 text-sm mt-1">Update your restaurant's profile details and delivery configurations.</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={settingsData.name}
                    onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cuisine Type</label>
                  <input
                    type="text"
                    required
                    value={settingsData.cuisine}
                    onChange={(e) => setSettingsData({ ...settingsData, cuisine: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Restaurant Address</label>
                <input
                  type="text"
                  required
                  value={settingsData.address}
                  onChange={(e) => setSettingsData({ ...settingsData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={settingsData.description}
                  onChange={(e) => setSettingsData({ ...settingsData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Delivery Time (e.g. 30-45 mins)</label>
                  <input
                    type="text"
                    required
                    value={settingsData.deliveryTime}
                    onChange={(e) => setSettingsData({ ...settingsData, deliveryTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Delivery Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settingsData.deliveryFee}
                    onChange={(e) => setSettingsData({ ...settingsData, deliveryFee: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Logo URL</label>
                <input
                  type="text"
                  value={settingsData.logo}
                  onChange={(e) => setSettingsData({ ...settingsData, logo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="w-full py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-700 transition disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                {settingsSaving ? 'Saving Changes...' : 'Save Restaurant Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Food Modal */}
      {foodModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-lg">{editFoodItem ? 'Edit Food Item' : 'Add New Food Item'}</h3>
            
            <form onSubmit={handleSubmit(handleFoodSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  {...register('name')}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  {...register('description')}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    {...register('price')}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Discount (%)</label>
                  <input
                    type="number"
                    {...register('discountPercentage')}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                <select
                  required
                  {...register('category')}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                >
                  <option value="">Select a Category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Availability</label>
                <select
                  {...register('availability')}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                >
                  <option value={true}>Available (In Stock)</option>
                  <option value={false}>Unavailable (Out of Stock)</option>
                </select>
              </div>

              {/* Upload image */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Food Image</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <FileImage className="w-4 h-4 text-brand" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {imageFile && <span className="text-xs font-mono text-slate-400 truncate max-w-[200px]">{imageFile.name}</span>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand text-white font-bold rounded-xl text-xs"
                >
                  Save Item
                </button>
                <button
                  type="button"
                  onClick={() => { setFoodModalOpen(false); setEditFoodItem(null); reset(); setImageFile(null); }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
