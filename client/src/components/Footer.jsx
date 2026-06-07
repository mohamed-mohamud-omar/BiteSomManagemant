import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-2xl font-black bg-gradient-to-r from-brand to-emerald-400 bg-clip-text text-transparent tracking-tight">
              {t('logo')}
            </span>
            <p className="text-sm text-slate-500 leading-relaxed">
              BiteSom is a premium food ordering & delivery platform bringing Mogadishu's finest restaurants directly to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">{t('home')}</Link></li>
              <li><Link to="/menu" className="hover:text-white transition">{t('menu')}</Link></li>
              <li><Link to="/about" className="hover:text-white transition">{t('about')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">{t('contact')}</Link></li>
            </ul>
          </div>

          {/* User Roles Quick entry */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Roles Portals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition">Customer Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Restaurant Manager</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Delivery Driver</Link></li>
              <li><Link to="/login" className="hover:text-white transition">System Administration</Link></li>
            </ul>
          </div>

          {/* Payment Methods Info */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Accepted Payments</h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              We support instant local mobile wallets and cash on delivery.
            </p>
            <div className="flex flex-wrap gap-2 text-slate-300 font-extrabold text-2xs uppercase">
              <span className="px-2 py-1 bg-slate-800 rounded">EVC Plus</span>
              <span className="px-2 py-1 bg-slate-800 rounded">Sahal</span>
              <span className="px-2 py-1 bg-slate-800 rounded">Zaad</span>
              <span className="px-2 py-1 bg-slate-800 rounded">COD</span>
              <span className="px-2 py-1 bg-brand/20 text-brand rounded">Stripe / Paypal</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 dark:text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BiteSom. {t('all_rights_reserved')}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
