import { Package, TrendingUp, ShoppingCart, AlertTriangle, Truck, CheckCircle, Star, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KPICards = ({ data }) => {
    const navigate = useNavigate();

    const displayData = [
        {
            title: 'Total Revenue',
            value: data ? `₹${data.totalRevenue?.toLocaleString()}` : '...',
            subtext: 'Asset Value',
            icon: DollarSign,
            color: 'bg-green-100 text-green-600',
            path: '/sales'
        },
        {
            title: 'Forecast Accuracy',
            value: data ? `${data.averageForecastAccuracy}%` : '...',
            subtext: 'AI Confidence',
            icon: TrendingUp,
            color: 'bg-blue-100 text-blue-600',
            path: '/forecasting'
        },
        {
            title: 'High Risk Products',
            value: data ? data.highRiskProductsCount : '...',
            subtext: 'Critical Attention',
            icon: AlertTriangle,
            color: 'bg-red-100 text-red-600',
            path: '/reorder'
        },

        {
            title: 'Low Stock Items',
            value: data ? data.lowStockItemsCount : '...',
            subtext: 'Needs Review',
            icon: ShoppingCart,
            color: 'bg-orange-100 text-orange-600',
            path: '/products'
        },
        {
            title: 'Total Sales (30d)',
            value: data ? data.totalSales30d : '...',
            subtext: 'Monthly Volume',
            icon: Package,
            color: 'bg-cyan-100 text-cyan-600',
            path: '/sales'
        },
        {
            title: 'Best Vendor',
            value: data ? data.bestPerformingVendor : '...',
            subtext: 'Cost-Effective',
            icon: Star,
            color: 'bg-indigo-100 text-indigo-600',
            path: '/vendors'
        },
        {
            title: 'System Health',
            value: data && data.inventoryHealth && data.inventoryHealth[0] ? `${data.inventoryHealth[0].value}%` : '...',
            subtext: 'Safe Stock Ratio',
            icon: CheckCircle,
            color: 'bg-emerald-100 text-emerald-600',
            path: '/reports'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {displayData.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div
                        key={index}
                        onClick={() => item.path && navigate(item.path)}
                        className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{item.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${item.color}`}>
                                <Icon size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <span className="text-gray-500">{item.subtext}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KPICards;
