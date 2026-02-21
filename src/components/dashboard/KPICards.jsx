import { Package, TrendingUp, ShoppingCart, AlertTriangle, Truck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KPICards = ({ data }) => {
    const navigate = useNavigate();

    const displayData = [
        {
            title: 'Total Products',
            value: data ? data.totalProducts : '...',
            subtext: 'In Inventory',
            icon: Package,
            color: 'bg-blue-100 text-blue-600',
            path: '/products'
        },
        {
            title: 'Total Stock Value',
            value: data ? `₹${data.inventoryValue?.toLocaleString()}` : '...',
            subtext: 'Asset Value',
            icon: TrendingUp,
            color: 'bg-green-100 text-green-600',
            path: '/reports'
        },
        {
            title: 'Reorder Alerts',
            value: data ? (data.reorderAlertCount || data.lowStockCount) : '...',
            subtext: 'Action needed',
            icon: AlertTriangle,
            color: 'bg-yellow-100 text-yellow-600',
            path: '/reorder'
        },
        {
            title: 'Pending Orders',
            value: data ? data.pendingVendorOrdersCount : '...',
            subtext: 'Vendor Restocks',
            icon: Truck,
            color: 'bg-purple-100 text-purple-600',
            path: '/vendor-orders'
        },
        {
            title: 'Out of Stock',
            value: data ? data.outOfStockCount : '...',
            subtext: 'Urgent Attention',
            icon: ShoppingCart,
            color: 'bg-red-100 text-red-600',
            path: '/reorder'
        },
        {
            title: 'Delivered Orders',
            value: data ? data.deliveredVendorOrdersCount : '...',
            subtext: 'Completed Restocks',
            icon: CheckCircle,
            color: 'bg-emerald-100 text-emerald-600',
            path: '/vendor-orders'
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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
