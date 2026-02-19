import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Reorder from './pages/Reorder';
import Sales from './pages/Sales';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
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
            <Route path="forecasting" element={<div className="p-4 text-gray-500">Forecasting Page (Coming Soon)</div>} />
            <Route path="reports" element={<div className="p-4 text-gray-500">Reports Page (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-4 text-gray-500">Settings Page (Coming Soon)</div>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
