import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    logo: 'BiteSom',
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    menu: 'Menu',
    cart: 'Cart',
    wishlist: 'Wishlist',
    login: 'Login',
    register: 'Register',
    profile: 'Profile',
    dashboard: 'Dashboard',
    orders: 'Orders',
    notifications: 'Notifications',
    logout: 'Logout',
    search_food: 'Search food, dishes...',
    categories: 'Popular Categories',
    popular_foods: 'Trending Foods',
    add_to_cart: 'Add to Cart',
    added_to_cart: 'Added to Cart',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    delivery_fee: 'Delivery Fee',
    discount: 'Discount',
    apply_coupon: 'Apply Coupon',
    coupon_placeholder: 'Enter coupon code',
    checkout: 'Checkout',
    place_order: 'Place Order',
    payment_method: 'Payment Method',
    delivery_address: 'Delivery Address',
    delivery_notes: 'Delivery Notes',
    full_name: 'Full Name',
    phone: 'Phone Number',
    address: 'Address',
    city: 'City',
    order_summary: 'Order Summary',
    no_items_cart: 'Your cart is empty.',
    view_details: 'View Details',
    verification_code: 'Delivery Code',
    status: 'Status',
    timeline: 'Timeline',
    track_order: 'Track Order',
    driver_assigned: 'Assigned Driver',
    order_delivered: 'Order Delivered!',
    completed_deliveries: 'Completed Deliveries',
    earnings: 'Earnings',
    coupons_list: 'Coupons Management',
    reports: 'Reports Export',
    admin_dashboard: 'Admin Dashboard',
    total_revenue: 'Total Revenue',
    total_orders: 'Total Orders',
    total_users: 'Total Customers',
    total_drivers: 'Total Drivers',
    total_restaurants: 'Restaurants',
    sales_trend: 'Sales Trend',
    category_distribution: 'Orders by Category',
    export_pdf: 'Export PDF',
    export_excel: 'Export Excel',
    loading: 'Loading...',
    all_rights_reserved: 'All rights reserved.'
  },
  so: {
    logo: 'BiteSom',
    home: 'Hore',
    about: 'Nagu Saabsan',
    contact: 'La Xiriir',
    menu: 'Cuntada',
    cart: 'Gaariga',
    wishlist: 'Liiska Jacaylka',
    login: 'Soo Gali',
    register: 'Diiwaan Gali',
    profile: 'Profile',
    dashboard: 'Dashboard',
    orders: 'Dalabaadka',
    notifications: 'Ogeysiisyada',
    logout: 'Ka Bax',
    search_food: 'Raadi cuntooyin, suxuun...',
    categories: 'Qaybaha Cuntada',
    popular_foods: 'Cuntooyinka Caanka ah',
    add_to_cart: 'Kudar Gaariga',
    added_to_cart: 'Waa lagu daray',
    price: 'Qiimaha',
    total: 'Warta Guud',
    subtotal: 'Cuntada Keliya',
    tax: 'Canshuur',
    delivery_fee: 'Khidmada Gaarsiinta',
    discount: 'Qiimo Dhimis',
    apply_coupon: 'Isticmaal Coupon',
    coupon_placeholder: 'Geli code-ka couponka',
    checkout: 'Bixi lacagta',
    place_order: 'Geli Dalabka',
    payment_method: 'Habka Lacag-bixinta',
    delivery_address: 'Ciwaanka Gaarsiinta',
    delivery_notes: 'Fariin gaar ah',
    full_name: 'Magaca Buuxa',
    phone: 'Lanbarka Taleefanka',
    address: 'Xaafada',
    city: 'Magaalada',
    order_summary: 'Faahfaahinta Dalabka',
    no_items_cart: 'Gaarigaagu waa maran yahay.',
    view_details: 'Fiiri Faahfaahinta',
    verification_code: 'Code-ka Gaarsiinta',
    status: 'Xaalada',
    timeline: 'Taariikhda Dalabka',
    track_order: 'Dabagac Dalabka',
    driver_assigned: 'Wadaadka Dalabka',
    order_delivered: 'Dalabku wuu ku soo gaaray!',
    completed_deliveries: 'Dalabaadka La Geeyay',
    earnings: 'Dakhliga',
    coupons_list: 'Maareynta Coupon-nada',
    reports: 'Warbixino Download',
    admin_dashboard: 'Maareynta Sare',
    total_revenue: 'Dakhliga Guud',
    total_orders: 'Dalabaadka Guud',
    total_users: 'Macaamiisha',
    total_drivers: 'Wadayaasha',
    total_restaurants: 'Maqaayadaha',
    sales_trend: 'Dhaqdhaqaaqa Iibka',
    category_distribution: 'Qaybaha Cuntada La Dalbaday',
    export_pdf: 'Kala soo bax PDF',
    export_excel: 'Kala soo bax Excel',
    loading: 'Wuu soo rarayaa...',
    all_rights_reserved: 'Xuquuqda oo dhan waa dhowran tahay.'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'so' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('language', nextLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
