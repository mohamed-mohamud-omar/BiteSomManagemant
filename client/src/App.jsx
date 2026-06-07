import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout & Common
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Sidebar from './components/Sidebar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Menu from './pages/Menu.jsx';
import FoodDetails from './pages/FoodDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import Profile from './pages/Profile.jsx';

// Role Dashboards
import RestaurantDashboard from './pages/RestaurantDashboard.jsx';
import DriverDashboard from './pages/DriverDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// --- Protected Route Helper ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, accessToken } = useSelector((state) => state.auth);

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// --- Layout Wrapper for Dashboards ---
const DashboardLayout = ({ children, role }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Sidebar role={role} />
        <main className="flex-1 glass-card p-6 min-h-[calc(100vh-10rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
          
          {/* Header Navbar */}
          <Navbar />

          {/* Main App viewport */}
          <div className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/food/:id" element={<FoodDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Protected routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['customer', 'restaurant_manager', 'driver', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/checkout" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Checkout />
                </ProtectedRoute>
              } />

              <Route path="/order-tracking/:id" element={
                <ProtectedRoute allowedRoles={['customer', 'driver', 'admin', 'restaurant_manager']}>
                  <OrderTracking />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <DashboardLayout role="customer">
                    <CustomerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/orders" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <DashboardLayout role="customer">
                    <CustomerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Restaurant manager portal routes */}
              <Route path="/restaurant/*" element={
                <ProtectedRoute allowedRoles={['restaurant_manager']}>
                  <DashboardLayout role="restaurant_manager">
                    <RestaurantDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Delivery Driver portal routes */}
              <Route path="/driver/*" element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DashboardLayout role="driver">
                    <DriverDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* System Admin Dashboard portal routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout role="admin">
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Fallback redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Premium Footer */}
          <Footer />

        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
