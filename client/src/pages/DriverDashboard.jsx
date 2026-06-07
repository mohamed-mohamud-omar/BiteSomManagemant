import React, { useEffect, useState } from 'react';
import { Truck, Compass, CheckCircle2, Clock, DollarSign, MapPin, Key } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useSocket } from '../context/SocketContext.jsx';

const DriverDashboard = () => {
  const { updateDriverLocation, socket } = useSocket();

  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/history')) return 'active';
    if (path.endsWith('/earnings')) return 'completed';
    return 'pool';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId) => {
    if (tabId === 'active') navigate('/driver/history');
    else if (tabId === 'completed') navigate('/driver/earnings');
    else navigate('/driver');
  };

  const [loading, setLoading] = useState(true);
  
  // Delivery OTP confirmation modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [confirmOrderId, setConfirmOrderId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Location simulation state
  const [simulatingLocation, setSimulatingLocation] = useState(false);
  const [simIntervalId, setSimIntervalId] = useState(null);

  const loadDriverData = async () => {
    try {
      // 1. Get available deliveries pool (Ready, no driver)
      const poolRes = await api.get('/orders/pool/ready');
      setAvailableOrders(poolRes.data.orders);

      // 2. Get my deliveries
      const myRes = await api.get('/orders/my/orders');
      const allMyOrders = myRes.data.orders;
      
      setActiveOrders(allMyOrders.filter(o => o.status === 'Out_For_Delivery'));
      setCompletedOrders(allMyOrders.filter(o => o.status === 'Delivered'));
    } catch (err) {
      console.error('Error fetching driver dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverData();

    return () => {
      // Clean up simulator interval if unmounted
      if (simIntervalId) {
        clearInterval(simIntervalId);
      }
    };
  }, [simIntervalId]);

  // Accept a delivery
  const handleAcceptDelivery = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/accept-delivery`);
      loadDriverData();
      navigate('/driver/history');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  // Complete a delivery (Trigger Modal)
  const openConfirmDeliveryModal = (orderId) => {
    setConfirmOrderId(orderId);
    setOtpCode('');
    setOtpError('');
    setOtpModalOpen(true);
  };

  const handleConfirmDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) return;

    try {
      await api.put(`/orders/${confirmOrderId}/status`, {
        status: 'Delivered',
        code: otpCode
      });
      
      // Turn off location simulation if completed
      handleStopSimulation();

      setOtpModalOpen(false);
      loadDriverData();
      navigate('/driver/earnings');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Incorrect verification PIN. Please verify with the customer.');
    }
  };

  // Coordinates Location simulation helper
  const handleStartSimulation = (orderId, driverId) => {
    if (simulatingLocation) return;

    setSimulatingLocation(true);
    let lat = 2.0433; // км4 Mogadishu starting coords
    let lng = 45.3182;

    const interval = setInterval(() => {
      // Small coordinate shift towards customer
      lat += (Math.random() - 0.3) * 0.0005;
      lng += (Math.random() - 0.3) * 0.0005;

      updateDriverLocation(driverId, orderId, { lat, lng });
      console.log('Simulating location update:', { lat, lng });
    }, 4000);

    setSimIntervalId(interval);
  };

  const handleStopSimulation = () => {
    if (simIntervalId) {
      clearInterval(simIntervalId);
      setSimIntervalId(null);
    }
    setSimulatingLocation(false);
  };

  const calculateEarnings = () => {
    // Each completed delivery pays the driver the restaurant's delivery fee
    return completedOrders.reduce((sum, order) => sum + (order.deliveryFee || 2.0), 0);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-brand mb-4" />
        <span>Loading driver portal...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Driver Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Accept deliveries, update coordinates, and track your cash earnings.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleTabClick('pool')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'pool' ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Delivery Pool ({availableOrders.length})
          </button>
          <button
            onClick={() => handleTabClick('active')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'active' ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            In Transit ({activeOrders.length})
          </button>
          <button
            onClick={() => handleTabClick('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'completed' ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Completed ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Driver earnings box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="block text-2xs text-slate-400 font-extrabold uppercase">Total Earnings</span>
            <span className="text-2xl font-black text-emerald-500">${calculateEarnings().toFixed(2)}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="block text-2xs text-slate-400 font-extrabold uppercase">Deliveries Completed</span>
            <span className="text-2xl font-black text-brand">{completedOrders.length}</span>
          </div>
          <div className="p-3 bg-brand/10 text-brand rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="block text-2xs text-slate-400 font-extrabold uppercase">Current Active Route</span>
            <span className="text-2xl font-black text-indigo-500">{activeOrders.length}</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Compass className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Available Delivery Pool */}
      {activeTab === 'pool' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">Available Delivery Jobs</h2>
          {availableOrders.length === 0 ? (
            <p className="text-slate-500 text-sm">No ready orders in the pool right now. Check back shortly!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableOrders.map((order) => (
                <div key={order._id} className="glass-card p-5 space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-mono text-xs text-slate-500">ID: {order._id.substring(0, 10)}...</span>
                    <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-accent font-extrabold rounded-lg text-3xs uppercase tracking-wide">
                      Payout: ${(order.deliveryFee || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-black text-xs text-slate-800 dark:text-slate-200">From: {order.restaurant?.name}</span>
                        <span className="text-xs text-slate-400">{order.restaurant?.address}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-black text-xs text-slate-800 dark:text-slate-200">To: {order.deliveryAddress.fullName}</span>
                        <span className="text-xs text-slate-400">{order.deliveryAddress.address}, {order.deliveryAddress.city}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptDelivery(order._id)}
                    className="w-full py-2.5 bg-brand hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" /> Accept Job & Start Delivery
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Deliveries */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">Active Deliveries In Transit</h2>
          {activeOrders.length === 0 ? (
            <p className="text-slate-500 text-sm">No active deliveries on your route right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeOrders.map((order) => (
                <div key={order._id} className="glass-card p-5 space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-mono text-xs text-slate-500">ID: {order._id.substring(0, 10)}...</span>
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 font-extrabold rounded-lg text-3xs uppercase tracking-wide animate-pulse">
                      In Transit
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p><span className="font-bold text-slate-400">Merchant:</span> {order.restaurant?.name} ({order.restaurant?.address})</p>
                    <p><span className="font-bold text-slate-400">Customer:</span> {order.deliveryAddress.fullName} ({order.deliveryAddress.phone})</p>
                    <p><span className="font-bold text-slate-400">Destination:</span> {order.deliveryAddress.address}, {order.deliveryAddress.city}</p>
                    {order.deliveryNotes && <p><span className="font-bold text-slate-400">Notes:</span> {order.deliveryNotes}</p>}
                  </div>

                  {/* Simulator coordinates and complete delivery buttons */}
                  <div className="flex gap-2 flex-col sm:flex-row">
                    {simulatingLocation ? (
                      <button
                        onClick={handleStopSimulation}
                        className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                      >
                        Stop Location Simulator
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartSimulation(order._id, order.driver?._id || order.driver)}
                        className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5 animate-spin" /> Sim Location Map
                      </button>
                    )}
                    <button
                      onClick={() => openConfirmDeliveryModal(order._id)}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Delivered
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Deliveries */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight">Delivery History</h2>
          {completedOrders.length === 0 ? (
            <p className="text-slate-500 text-sm font-semibold">No deliveries completed yet.</p>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-400 text-2xs uppercase tracking-wider">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Restaurant</th>
                      <th className="px-6 py-4">Recipient</th>
                      <th className="px-6 py-4">Fee Payout</th>
                      <th className="px-6 py-4">Delivery Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                    {completedOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {order._id.substring(0, 10)}...
                        </td>
                        <td className="px-6 py-4">
                          {order.restaurant?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {order.deliveryAddress?.fullName}
                        </td>
                        <td className="px-6 py-4 text-emerald-500 font-black">
                          +${(order.deliveryFee || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OTP Delivery Confirmation Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">Confirm Customer Delivery</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Please enter the 4-digit verification PIN provided by the customer to complete this delivery.
              </p>
            </div>

            <form onSubmit={handleConfirmDeliverySubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="0000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center px-4 py-3 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xl font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                />
              </div>

              {otpError && (
                <span className="block text-xs font-semibold text-rose-500 leading-tight">
                  {otpError}
                </span>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs"
                >
                  Verify & Deliver
                </button>
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
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

export default DriverDashboard;
