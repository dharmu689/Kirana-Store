import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Reorder from './pages/Reorder';
import Sales from './pages/Sales';
import ProtectedRoute from './components/ProtectedRoute';
import VendorOrders from './pages/VendorOrders';
import Vendors from './pages/Vendors';
import Forecasting from './pages/Forecasting';
import VendorCompare from './pages/VendorCompare';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function AppContent() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
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
