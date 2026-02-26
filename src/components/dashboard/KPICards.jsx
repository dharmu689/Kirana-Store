import { Package, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const KPICards = ({ data }) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    const displayData = [
        {
            title: t?.todayRevenue || 'Today Revenue',
            value: data ? `₹${data.todayRevenue?.toLocaleString()}` : '...',
            subtext: t?.dailyEarnings || 'Daily earnings',
            icon: DollarSign,
            color: 'bg-green-100 text-[var(--color-brand-green)] dark:bg-[var(--color-brand-green)]/20',
            path: '/sales'
        },
        {
            title: t?.monthlyRevenue || 'Monthly Revenue',
            value: data ? `₹${data.monthlyRevenue?.toLocaleString()}` : '...',
            subtext: t?.monthlyEarnings || 'Monthly earnings',
            icon: TrendingUp,
            color: 'bg-blue-100 text-[var(--color-brand-blue)] dark:bg-[var(--color-brand-blue)]/20',
            path: '/sales'
        },
        {
            title: t?.totalOrders || 'Total Orders',
            value: data !== null ? data.totalOrders : '...',
            subtext: t?.totalOrdersPlaced || 'Total orders placed',
            icon: Package,
            color: 'bg-blue-50 text-[var(--color-brand-blue-hover)] dark:bg-[var(--color-brand-blue-hover)]/20',
            path: '/sales'
        },
        {
            title: t?.lowStock || 'Low Stock',
            value: data !== null ? data.lowStockCount : '...',
            subtext: t?.requiresReorder || 'Requires reorder',
            icon: AlertTriangle,
            color: 'bg-orange-100 text-[var(--color-brand-orange)] dark:bg-[var(--color-brand-orange)]/20',
            path: '/reorder'
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
                        className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover-mac-folder`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{item.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</h3>
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
