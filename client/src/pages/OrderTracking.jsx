import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Check, 
  MapPin, 
  Phone, 
  Clock, 
  CreditCard, 
  ArrowLeft, 
  Navigation,
  Compass
} from 'lucide-react';
import api from '../services/api.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const OrderTracking = () => {
  const { id } = useParams();
  const { joinOrderTracking, leaveOrderTracking, socket } = useSocket();
  const { t } = useLanguage();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverCoord, setDriverCoord] = useState({ lat: 2.0433, lng: 45.3182 }); // Mock Mogadishu KM4 starting coordinates

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Socket listeners setup
    joinOrderTracking(id);

    return () => {
      leaveOrderTracking(id);
    };
  }, [id]);

  // Handle Socket Events in Real-Time
  useEffect(() => {
    if (socket) {
      // Listen to status updates
      socket.on('order_update', (data) => {
        if (data.orderId === id) {
          setOrder((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: data.status,
              timeline: data.timeline,
              driver: data.driver ? data.driver : prev.driver
            };
          });
        }
      });

      // Listen to driver location updates
      socket.on('driver_location', (data) => {
        setDriverCoord(data.location);
      });
    }

    return () => {
      if (socket) {
        socket.off('order_update');
        socket.off('driver_location');
      }
    };
  }, [socket, id]);

  const getTimelineSteps = () => {
    return [
      { id: 'Pending', label: 'Order Placed', desc: 'Awaiting restaurant approval' },
      { id: 'Accepted', label: 'Accepted', desc: 'Approved by kitchen staff' },
      { id: 'Preparing', label: 'Preparing', desc: 'Cooking your fresh meal' },
      { id: 'Ready', label: 'Ready', desc: 'Awaiting driver collection' },
      { id: 'Out_For_Delivery', label: 'Out for Delivery', desc: 'Driver is on their way' },
      { id: 'Delivered', label: 'Delivered', desc: 'Order completed' }
    ];
  };

  const getStepIndex = (status) => {
    const steps = getTimelineSteps();
    return steps.findIndex((step) => step.id === status);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-brand mb-4" />
        <span>Loading tracking details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500 space-y-4">
        <h1 className="text-xl font-bold">Order not found.</h1>
        <Link to="/" className="px-6 py-2 bg-brand text-white rounded-xl text-xs">Return Home</Link>
      </div>
    );
  }

  const steps = getTimelineSteps();
  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-3xs font-mono font-extrabold text-slate-400">ORDER ID: {order._id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Tracking Side */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tracking Summary */}
          <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/10 to-slate-950/20 -z-10"></div>
            <div className="space-y-1">
              <span className="block text-2xs text-brand font-black uppercase tracking-wider">Estimated Delivery</span>
              <h2 className="text-3xl font-black">{order.status === 'Delivered' ? 'Arrived!' : '25-35 Mins'}</h2>
            </div>
            
            {/* OTP Verification code */}
            {order.status !== 'Delivered' && order.verificationCode && (
              <div className="bg-brand/10 border border-brand/30 px-4 py-3 rounded-2xl text-center min-w-[140px]">
                <span className="block text-4xs font-extrabold text-brand uppercase tracking-widest">{t('verification_code')}</span>
                <span className="text-2xl font-mono font-black text-brand tracking-widest">{order.verificationCode}</span>
                <span className="block text-5xs text-slate-400 mt-0.5 leading-none">Share with driver upon arrival</span>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="glass-card p-6 space-y-8">
            <h3 className="font-black text-lg border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
              {t('timeline')}
            </h3>

            <div className="relative pl-8 space-y-8 before:absolute before:inset-y-1 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isActive = idx === currentStepIdx;
                
                return (
                  <div key={step.id} className="relative flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    {/* Node Dot */}
                    <div className={`absolute -left-8.5 top-1.5 w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 transition ${
                      isCompleted 
                        ? 'bg-brand border-brand text-white' 
                        : isActive 
                          ? 'bg-white dark:bg-slate-950 border-brand text-brand shadow-sm animate-pulse' 
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-300'
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand' : 'bg-transparent'}`} />}
                    </div>

                    <div className="space-y-0.5 text-left">
                      <span className={`block font-bold text-sm ${isActive ? 'text-brand' : 'text-slate-800 dark:text-slate-200'}`}>
                        {step.label}
                      </span>
                      <span className="block text-xs text-slate-400">{step.desc}</span>
                    </div>

                    {/* Timestamp log from timeline */}
                    {order.timeline.find((t) => t.status === step.id) && (
                      <span className="text-3xs font-semibold text-slate-400 sm:self-center">
                        {new Date(order.timeline.find((t) => t.status === step.id).timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Map & Driver Details */}
        <div className="space-y-6">
          
          {/* Driver Details Card */}
          {order.driver ? (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-black text-sm text-slate-400 uppercase tracking-wider">{t('driver_assigned')}</h3>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">
                  {order.driver.fullName.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-sm">{order.driver.fullName}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Phone className="w-3 h-3 text-brand" /> {order.driver.phone}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-slate-500 py-8 space-y-2">
              <Compass className="w-10 h-10 text-slate-300 mx-auto animate-spin" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Awaiting Driver Pickup</h4>
              <p className="text-xs">Once the kitchen completes preparation, a delivery driver will be assigned.</p>
            </div>
          )}

          {/* Delivery Map Simulation Placeholder */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <span className="font-bold text-xs flex items-center gap-1.5"><Navigation className="w-4 h-4 text-brand animate-pulse" /> Live Tracker</span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded text-3xs font-extrabold font-mono">SIMULATION</span>
            </div>
            
            {/* Styled Map Graphic */}
            <div className="h-64 relative bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Fake Road grids */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400 via-transparent to-transparent"></div>
              <div className="absolute top-0 bottom-0 left-[40%] w-3 bg-slate-300 dark:bg-slate-800 border-x border-slate-400/20"></div>
              <div className="absolute left-0 right-0 top-[50%] h-3 bg-slate-300 dark:bg-slate-800 border-y border-slate-400/20 rotate-1"></div>
              <div className="absolute top-0 bottom-0 left-[75%] w-3 bg-slate-300 dark:bg-slate-800 border-x border-slate-400/20 -rotate-12"></div>
              
              {/* Restaurant marker */}
              <div className="absolute left-[37%] top-[30%] text-center">
                <div className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center shadow-lg border border-white">
                  <span className="text-xs font-black">R</span>
                </div>
                <span className="block text-5xs font-bold text-slate-500 mt-0.5">Kitchen</span>
              </div>

              {/* Customer marker */}
              <div className="absolute left-[70%] top-[70%] text-center">
                <div className="w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border border-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="block text-5xs font-bold text-slate-500 mt-0.5">You</span>
              </div>

              {/* Driver moving dot */}
              {order.status === 'Out_For_Delivery' && (
                <div className="absolute left-[52%] top-[45%] text-center animate-bounce">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-amber-500/20">
                    <Truck className="w-4.5 h-4.5" />
                  </div>
                  <span className="block text-5xs font-extrabold text-amber-500 mt-0.5">Driver</span>
                </div>
              )}
              
              {order.status === 'Delivered' ? (
                <span className="text-xs font-bold text-slate-400">Delivery Completed</span>
              ) : order.status !== 'Out_For_Delivery' ? (
                <span className="text-xs font-semibold text-slate-400">Driver tracking active on dispatch</span>
              ) : null}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
