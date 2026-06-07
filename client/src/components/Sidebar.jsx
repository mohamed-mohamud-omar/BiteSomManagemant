import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Truck, 
  ShoppingBag, 
  Ticket, 
  FileSpreadsheet, 
  Settings, 
  ChefHat, 
  DollarSign 
} from 'lucide-react';

const Sidebar = ({ role }) => {
  
  // Define sidebar navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Restaurants', path: '/admin/restaurants', icon: Store },
          { name: 'Drivers', path: '/admin/drivers', icon: Truck },
          { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
          { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
          { name: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
        ];
      case 'restaurant_manager':
        return [
          { name: 'Dashboard', path: '/restaurant', icon: LayoutDashboard },
          { name: 'Manage Foods', path: '/restaurant/foods', icon: ChefHat },
          { name: 'Manage Orders', path: '/restaurant/orders', icon: ShoppingBag },
          { name: 'Settings', path: '/restaurant/settings', icon: Settings },
        ];
      case 'driver':
        return [
          { name: 'Dashboard', path: '/driver', icon: LayoutDashboard },
          { name: 'My Deliveries', path: '/driver/history', icon: ShoppingBag },
          { name: 'My Earnings', path: '/driver/earnings', icon: DollarSign },
        ];
      default:
        return [
          { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Orders', path: '/dashboard/orders', icon: ShoppingBag },
          { name: 'My Profile', path: '/profile', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-full md:w-64 glass-card md:min-h-[calc(100vh-6rem)] p-4 flex flex-col gap-1.5 md:sticky md:top-20">
      <div className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">
        Navigation
      </div>
      
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-brand text-white shadow-sm shadow-brand/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};

export default Sidebar;
