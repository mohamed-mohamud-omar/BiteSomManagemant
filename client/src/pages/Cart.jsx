import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ArrowRight, Ticket, Check, ShieldAlert, ShoppingCart } from 'lucide-react';
import { 
  removeFromCart, 
  updateQuantity, 
  applyCouponSuccess, 
  removeCoupon, 
  selectCartTotals 
} from '../features/cartSlice.js';
import api from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const cartItems = useSelector((state) => state.cart.items);
  const coupon = useSelector((state) => state.cart.coupon);
  
  const { subtotal, tax, deliveryFee, discount, total } = useSelector(selectCartTotals);

  // Coupon apply states
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleQtyChange = (foodId, currentQty, amount) => {
    dispatch(updateQuantity({ foodId, quantity: currentQty + amount }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.trim() });
      dispatch(applyCouponSuccess({
        code: res.data.code,
        discountPercentage: res.data.discountPercentage
      }));
      setCouponCode('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black">{t('no_items_cart')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Browse our delicious menu categories and add your favorite dishes to start ordering.
        </p>
        <Link 
          to="/menu" 
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand text-white font-bold rounded-xl shadow-md hover:bg-brand-700 transition text-sm"
        >
          <span>Explore Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black mb-8 tracking-tight">{t('cart')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const hasDiscount = item.discountPercentage > 0;
            const priceAfterDiscount = item.price * (1 - (item.discountPercentage || 0) / 100);

            return (
              <div key={item.foodId} className="glass-card p-4 flex gap-4 items-center flex-col sm:flex-row text-center sm:text-left">
                {/* Food Image */}
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                />

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{item.name}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-sm font-black">${priceAfterDiscount.toFixed(2)}</span>
                        <span className="text-xs text-slate-400 line-through">${item.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-black">${item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {/* Qty Selector */}
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => handleQtyChange(item.foodId, item.quantity, -1)}
                    className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xs text-slate-500 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(item.foodId, item.quantity, 1)}
                    className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xs text-slate-500 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex items-center gap-6 justify-between sm:justify-end w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  <span className="font-black text-sm">
                    ${(priceAfterDiscount * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => dispatch(removeFromCart(item.foodId))}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-black text-lg border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
              Summary
            </h3>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tax')} (5%)</span>
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

            {/* Check-out buttons */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-700 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Coupon apply box */}
          <div className="glass-card p-6">
            {coupon ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="block font-black text-xs text-emerald-800 dark:text-emerald-300">Code Applied</span>
                    <span className="text-2xs font-extrabold uppercase text-emerald-600 font-mono">{coupon.code} ({coupon.discountPercentage}% off)</span>
                  </div>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase">Apply Promo Coupon</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Ticket className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="WELCOME20"
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{couponError}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
