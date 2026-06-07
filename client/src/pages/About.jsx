import React from 'react';
import { ChefHat, ShieldCheck, Heart, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Introduction Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Redefining Food Delivery <br />
            <span className="bg-gradient-to-r from-brand to-emerald-400 bg-clip-text text-transparent">in Mogadishu</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
            BiteSom was founded to bridge the gap between Mogadishu's traditional kitchens and modern customers who value speed, convenience, and transparency. By providing an end-to-end portal architecture for customers, restaurants, drivers, and administrators, we ensure every order is fresh and on-time.
          </p>
          <div className="flex gap-4 font-extrabold text-xs">
            <div className="bg-brand/10 text-brand px-4 py-2 rounded-xl">Est. 2026</div>
            <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl">MERN Stack Production Ready</div>
          </div>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600"
            alt="Cooking food"
            className="rounded-3xl shadow-xl w-full h-[320px] object-cover border border-slate-200/40 dark:border-slate-800/40"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-8">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black">Our Core Values</h2>
          <p className="text-slate-500 text-sm mt-1">What drives BiteSom operations every day</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 text-center space-y-3">
            <ChefHat className="w-8 h-8 text-brand mx-auto" />
            <h3 className="font-bold">Gourmet Quality</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">We partner with verified kitchens to guarantee standard ingredient selection and prep.</p>
          </div>
          <div className="glass-card p-6 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="font-bold">Secure Transactions</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Fast and direct local mobile payments using EVC Plus, Sahal, or Zaad codes.</p>
          </div>
          <div className="glass-card p-6 text-center space-y-3">
            <Heart className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="font-bold">Customer Obsessed</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Real-time socket updates ensure you never have to wonder where your dinner is.</p>
          </div>
          <div className="glass-card p-6 text-center space-y-3">
            <Users className="w-8 h-8 text-sky-500 mx-auto" />
            <h3 className="font-bold">Community Support</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Empowering delivery drivers with transparent earnings trackers and flexible hours.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
