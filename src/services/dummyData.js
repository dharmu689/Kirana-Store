
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, FileText, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const KPIData = [
    {
        title: 'Total Products',
        value: '1,250',
        subtext: '+12 added today',
        icon: Package,
        color: 'bg-blue-100 text-blue-600',
    },
    {
        title: 'Total Stock Value',
        value: '₹8,45,000',
        subtext: '+5% from last month',
        icon: TrendingUp,
        color: 'bg-green-100 text-green-600',
    },
    {
        title: 'Monthly Revenue',
        value: '₹3,20,000',
        subtext: '+12% from last month',
        icon: ShoppingCart,
        color: 'bg-purple-100 text-purple-600',
    },
    {
        title: 'Low Stock Items',
        value: '15',
        subtext: 'Action needed',
        icon: AlertTriangle, // Changed from AlertCircle to AlertTriangle for better warning semantic
        color: 'bg-red-100 text-red-600',
    },
];

export const SALES_DATA = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
];

export const STOCK_STATUS = [
    { label: 'In Stock', value: 75, color: 'bg-emerald-500' },
    { label: 'Low Stock', value: 15, color: 'bg-amber-500' },
    { label: 'Out of Stock', value: 10, color: 'bg-red-500' },
];

export const REORDER_ALERTS = [
    { id: 1, name: 'Parle-G Biscuits', quantity: 12, reorderLevel: 20, status: 'Low Stock' },
    { id: 2, name: 'Tata Salt 1kg', quantity: 5, reorderLevel: 15, status: 'Critical' },
    { id: 3, name: 'Maggi Noodles', quantity: 0, reorderLevel: 50, status: 'Out of Stock' },
    { id: 4, name: 'Amul Butter 500g', quantity: 8, reorderLevel: 10, status: 'Low Stock' },
];

export const EXPIRY_ALERTS = [
    { id: 1, name: 'Milk (1L Pouch)', daysLeft: 1, status: 'Expires Tomorrow' },
    { id: 2, name: 'Bread (Whole Wheat)', daysLeft: 2, status: 'Expires in 2 days' },
    { id: 3, name: 'Curd (200g)', daysLeft: 0, status: 'Expired' },
];

export const SIDEBAR_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Sales', icon: ShoppingCart, path: '/sales' },
    { name: 'Reorder', icon: AlertTriangle, path: '/reorder' },
    { name: 'Forecasting', icon: TrendingUp, path: '/forecasting' },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];
