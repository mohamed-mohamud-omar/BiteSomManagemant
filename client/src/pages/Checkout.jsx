import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Truck, ShoppingBag, ShieldAlert, CreditCard } from 'lucide-react';
import api from '../services/api.js';
import { clearCart, selectCartTotals } from '../features/cartSlice.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const cartItems = useSelector((state) => state.cart.items);
  const coupon = useSelector((state) => state.cart.coupon);
  const { user } = useSelector((state) => state.auth);

  const { subtotal, tax, deliveryFee, discount, total } = useSelector(selectCartTotals);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || 'Mogadishu',
      deliveryNotes: '',
    }
  });

  const [paymentMethod, setPaymentMethod] = useState('EVC_Plus');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const itemsPayload = cartItems.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
        price: item.price
      }));

      const payload = {
        items: itemsPayload,
        restaurantId: cartItems[0].restaurantId,
        deliveryAddress: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
        },
        deliveryNotes: data.deliveryNotes,
        paymentMethod: paymentMethod,
        couponCode: coupon?.code || ''
      };

      const res = await api.post('/orders', payload);
      
      // Clear cart
      dispatch(clearCart());
      
      // Redirect to Order Tracking timeline page
      navigate(`/order-tracking/${res.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h1 className="text-xl font-bold">Your cart is empty. Checkout cannot proceed.</h1>
        <button onClick={() => navigate('/menu')} className="px-6 py-2 bg-brand text-white font-bold rounded-xl text-xs">
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black mb-8 tracking-tight">{t('checkout')}</h1>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm mb-6">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Address Form */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-black text-lg flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
              <Truck className="w-5 h-5 text-brand" /> {t('delivery_address')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('full_name')}</label>
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
                {errors.fullName && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.fullName.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('phone')}</label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
                {errors.phone && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.phone.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('address')} / District</label>
                <input
                  type="text"
                  {...register('address', { required: 'Delivery address is required' })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
                {errors.address && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.address.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('city')}</label>
                <input
                  type="text"
                  {...register('city', { required: 'City is required' })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
                {errors.city && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.city.message}</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('delivery_notes')}</label>
              <textarea
                rows={2}
                {...register('deliveryNotes')}
                placeholder="Gate code, landmark near door, etc."
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              ></textarea>
            </div>
          </div>

          {/* 2. Payment Options */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-black text-lg flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
              <CreditCard className="w-5 h-5 text-brand" /> {t('payment_method')}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'EVC_Plus', label: 'EVC Plus', desc: 'Simulated Wallet' },
                { id: 'Sahal', label: 'Sahal', desc: 'Simulated Wallet' },
                { id: 'Zaad', label: 'Zaad', desc: 'Simulated Wallet' },
                { id: 'COD', label: 'Cash On Delivery', desc: 'Pay at Door' },
              ].map((method) => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-2xl border text-center transition-all duration-150 flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === method.id 
                      ? 'border-brand bg-brand/5 text-brand font-bold ring-2 ring-brand/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-sm tracking-tight">{method.label}</span>
                  <span className="text-3xs text-slate-400 dark:text-slate-500 font-extrabold uppercase">{method.desc}</span>
                </button>
              ))}
            </div>
            
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 text-3xs font-extrabold flex gap-2 items-center leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Simulation mode enabled. EVC Plus, Sahal, and Zaad payments are automatically cleared successfully. Card payment integrations ready.</span>
            </div>
          </div>
        </div>

        {/* Right Side Summary */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-black text-lg flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
              <ShoppingBag className="w-5 h-5 text-brand" /> {t('order_summary')}
            </h3>

            {/* Item list */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 text-sm">
              {cartItems.map((item) => (
                <div key={item.foodId} className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="truncate max-w-[150px] font-semibold">{item.name} <span className="text-xs text-brand font-black">x{item.quantity}</span></span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="border-slate-200 dark:border-slate-800/60" />

            {/* Calculations */}
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tax')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('delivery_fee')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${deliveryFee.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>{t('discount')}</span>
                  <span className="font-semibold">-${discount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-slate-200 dark:border-slate-800/60 my-2" />
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1">
                <span>{t('total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-700 transition disabled:opacity-50"
            >
              {loading ? t('loading') : `${t('place_order')} ($${total.toFixed(2)})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
