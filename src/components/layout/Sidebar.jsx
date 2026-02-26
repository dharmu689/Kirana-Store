import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_ITEMS } from '../../services/dummyData';
import clsx from 'clsx';
import { LogOut, User } from 'lucide-react';
import authService from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className={clsx(
            "w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col fixed left-0 top-0 shadow-xl lg:shadow-sm z-50 transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Brand Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-50">
                {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-blue-200">
                    <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">Kirana<span className="text-blue-600">Pro</span></span> */}
                <img src="/KiranaSmart.svg" alt="KiranaSmart Logo" className="h-20" />
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                    const user = JSON.parse(localStorage.getItem('user'));
                    const isAdmin = user && user.role === 'admin';

                    // Hide Vendor Orders and Vendors from non-admins
                    if ((item.path === '/vendor-orders' || item.path === '/vendors') && !isAdmin) {
                        return null;
                    }

                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    const getTranslationKey = (name) => {
                        if (name === 'Vendor Orders') return 'vendorOrders';
                        return name.toLowerCase();
                    };
                    const translatedName = translations[language]?.[getTranslationKey(item.name)] || item.name;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={clsx(
                                "flex items-center px-4 py-3 rounded-xl transition-all duration-300 group text-sm font-medium hover-mac-folder",
                                isActive
                                    ? "bg-[var(--color-brand-blue)] text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20"
                                    : "text-gray-500 hover:bg-blue-50/50 dark:bg-gray-800 hover:text-[var(--color-brand-blue)] dark:text-gray-300 dark:hover:bg-gray-700/50"
                            )}
                        >
                            <Icon
                                size={20}
                                className={clsx(
                                    "mr-3 transition-colors duration-300",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-[var(--color-brand-blue)] dark:text-gray-400"
                                )}
                            />
                            {translatedName}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-gray-50">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:bg-gray-800 transition-colors group">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User size={20} />
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Store Manager</p>
                            <p className="text-xs text-gray-500 truncate">View Profile</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
