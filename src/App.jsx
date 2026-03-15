import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Eagerly Load Critical Routes
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazily Load Heavy Dashboard Routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Reorder = lazy(() => import('./pages/Reorder'));
const Sales = lazy(() => import('./pages/Sales'));
const VendorOrders = lazy(() => import('./pages/VendorOrders'));
const Vendors = lazy(() => import('./pages/Vendors'));
const Forecasting = lazy(() => import('./pages/Forecasting'));
const VendorCompare = lazy(() => import('./pages/VendorCompare'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Lazily Load Public Pages
const Features = lazy(() => import('./pages/public/Features'));
const Pricing = lazy(() => import('./pages/public/Pricing'));
const Testimonials = lazy(() => import('./pages/public/Testimonials'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/public/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/public/CookiePolicy'));
const DataSecurity = lazy(() => import('./pages/public/DataSecurity'));

// Simple Loading Spinner for Suspense Fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function AppContent() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/data-security" element={<DataSecurity />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="sales" element={<Sales />} />
              <Route path="reorder" element={<Reorder />} />
              <Route path="vendor-orders" element={<VendorOrders />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="forecasting" element={<Forecasting />} />
              <Route path="vendor-compare/:productId" element={<VendorCompare />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
