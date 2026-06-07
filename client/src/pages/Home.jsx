import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronRight, ShoppingBag, ShieldCheck, MapPin, Truck } from 'lucide-react';
import api from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories.slice(0, 4)); // Show recent 4 categories
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 py-20 px-6 sm:px-12 flex flex-col md:flex-row items-center gap-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-800/20 via-slate-900 to-slate-900 -z-10"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex-1 space-y-6 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/20 text-brand rounded-full text-xs font-extrabold uppercase tracking-wide">
            <Truck className="w-3.5 h-3.5 animate-bounce" /> Fast Mogadishu Delivery
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Delicious Suxuun <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand to-emerald-300 bg-clip-text text-transparent">Directly to Your Table</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Order Bariis, gourmet burgers, fresh juices, and pizzas from Mogadishu's premium kitchens. Quick checkout, instant status updates, and real-time mapping trackers.
          </p>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md pt-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={t('search_food')}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition text-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-brand text-white font-bold rounded-2xl shadow-lg shadow-brand/20 hover:bg-brand-700 transition duration-150 flex items-center justify-center gap-1.5"
            >
              <span>Explore</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Hero Image */}
        <div className="flex-1 w-full max-w-md md:max-w-none flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-brand/20 rounded-full blur-2xl"></div>
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80"
              alt="Somali delicious food"
              className="rounded-3xl shadow-2xl relative w-full h-[320px] object-cover border-4 border-slate-800 rotate-1 transform scale-95"
            />
            {/* Float badge */}
            <div className="absolute -bottom-4 -left-4 glass-effect p-4 rounded-2xl shadow-lg border border-slate-700 flex items-center gap-3 animate-pulse">
              <div className="p-2 bg-brand/10 text-brand rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-2xs text-slate-400 font-bold uppercase tracking-wider">Fastest Route</span>
                <span className="text-sm font-black dark:text-white text-slate-800">25 Min Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t('categories')}</h2>
            <p className="text-slate-500 text-sm mt-1">Browse menus sorted by category</p>
          </div>
          <Link to="/menu" className="flex items-center gap-1 text-sm font-bold text-brand hover:underline">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-shimmer h-32 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/menu?category=${cat._id}`}
                  className="group relative h-32 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/50 dark:border-slate-800/40"
                >
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4">
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight">{cat.name}</span>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">How BiteSom Works</h2>
          <p className="text-slate-500 text-sm mt-1">Enjoy Mogadishu's easiest delivery pipeline in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto text-lg font-bold">1</div>
            <h3 className="font-bold text-lg">Select Your Food</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Search by cuisines or category filters to find classic burgers, Bariis, or fresh mango juices from top kitchens.
            </p>
          </div>
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-lg font-bold">2</div>
            <h3 className="font-bold text-lg">Checkout via Mobile Wallet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Pay quickly using simulated EVC Plus, Sahal, or Zaad. Or choose simple Cash on Delivery (COD).
            </p>
          </div>
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto text-lg font-bold">3</div>
            <h3 className="font-bold text-lg">Real-Time Tracking</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Follow your order timeline updates instantly as the restaurant prepares it and your driver picks it up.
            </p>
          </div>
        </div>
      </section>

      {/* 4. VALUE PROPOSITION BANNER */}
      <section className="bg-slate-100 dark:bg-slate-900 rounded-3xl mx-4 sm:mx-6 lg:mx-8 py-10 px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 bg-brand/10 text-brand rounded-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">First time ordering from BiteSom?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Use promo code <span className="font-mono font-black text-brand">WELCOME20</span> at checkout to get 20% off your total!</p>
          </div>
        </div>
        <Link to="/menu" className="px-6 py-3 bg-slate-900 dark:bg-brand text-white font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-brand-700 transition flex items-center gap-1 text-sm shadow-md">
          <span>Explore Menu</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};

export default Home;
