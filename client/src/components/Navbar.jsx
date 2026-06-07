import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingCart, 
  Heart, 
  Menu as MenuIcon, 
  X, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard,
  Globe
} from 'lucide-react';
import { logout } from '../features/authSlice.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const { darkMode, toggleDarkMode } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'restaurant_manager': return '/restaurant';
      case 'driver': return '/driver';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="sticky top-0 z-40 glass-effect border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black bg-gradient-to-r from-brand to-emerald-400 bg-clip-text text-transparent tracking-tight">
                {t('logo')}
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-brand transition">{t('home')}</Link>
            <Link to="/menu" className="text-sm font-medium hover:text-brand transition">{t('menu')}</Link>
            <Link to="/about" className="text-sm font-medium hover:text-brand transition">{t('about')}</Link>
            <Link to="/contact" className="text-sm font-medium hover:text-brand transition">{t('contact')}</Link>
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-sm"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-bold text-xs uppercase">{language}</span>
            </button>

            {/* Dark Mode Switcher */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition relative">
              <Heart className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-2xs font-extrabold leading-none text-white bg-rose-500 transform translate-x-1 -translate-y-1">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition relative">
              <ShoppingCart className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-2xs font-extrabold leading-none text-white bg-brand transform translate-x-1 -translate-y-1">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Access Profiles */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card py-2 z-50">
                    <Link 
                      to={getDashboardPath()} 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t('dashboard')}
                    </Link>
                    <Link 
                      to="/profile" 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <UserIcon className="w-4 h-4" />
                      {t('profile')}
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                  {t('login')}
                </Link>
                <Link to="/register" className="px-4 py-1.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center md:hidden gap-3">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold uppercase"
            >
              {language}
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-500" />}
            </button>
            <Link to="/cart" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition relative">
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-2xs font-extrabold leading-none text-white bg-brand transform translate-x-1 -translate-y-1">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-effect border-b border-slate-200/50 dark:border-slate-800/40 p-4 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium hover:text-brand transition">{t('home')}</Link>
          <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium hover:text-brand transition">{t('menu')}</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium hover:text-brand transition">{t('about')}</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium hover:text-brand transition">{t('contact')}</Link>
          <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium hover:text-brand transition">{t('wishlist')}</Link>
          <hr className="border-slate-200 dark:border-slate-800" />
          
          {user ? (
            <div className="space-y-2">
              <div className="font-semibold text-xs text-slate-400 py-1 uppercase">{user.role} Dashboard</div>
              <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-brand transition">{t('dashboard')}</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-brand transition">{t('profile')}</Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left block py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold">
                {t('login')}
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold">
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
