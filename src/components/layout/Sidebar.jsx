import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_ITEMS } from '../../services/dummyData';
import clsx from 'clsx';
import { LogOut, User } from 'lucide-react';
import authService from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const Sidebar = ({ isOpen, setIsOpen, isCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className={clsx(
            "h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col fixed left-0 top-0 shadow-xl lg:shadow-sm z-50 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Brand Logo */}
            <div className={clsx("h-16 flex items-center border-b border-gray-50 overflow-hidden", isCollapsed ? "justify-center px-0" : "px-6")}>
                {isCollapsed ? (
                    <span className="text-2xl font-black text-[var(--color-brand-blue)] tracking-tight">K</span>
                ) : (
                    <img src="/KiranaSmart.svg" alt="KiranaSmart Logo" className="h-20 shrink-0" />
                )}
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
                                "flex items-center rounded-xl transition-all duration-300 group font-medium hover-mac-folder",
                                isCollapsed ? "justify-center p-3" : "px-4 py-3 text-sm",
                                isActive
                                    ? "bg-[var(--color-brand-blue)] text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20"
                                    : "text-gray-500 hover:bg-blue-50/50 dark:bg-gray-800 hover:text-[var(--color-brand-blue)] dark:text-gray-300 dark:hover:bg-gray-700/50"
                            )}
                            title={isCollapsed ? translatedName : undefined}
                        >
                            <Icon
                                size={20}
                                className={clsx(
                                    "transition-colors duration-300 shrink-0",
                                    !isCollapsed && "mr-3",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-[var(--color-brand-blue)] dark:text-gray-400"
                                )}
                            />
                            {!isCollapsed && <span className="truncate">{translatedName}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-gray-50">
                <div className={clsx(
                    "bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group overflow-hidden",
                    isCollapsed ? "justify-center p-2" : "justify-between p-3"
                )}>
                    <div className="flex items-center overflow-hidden">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User size={20} />
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Store Manager</p>
                                <p className="text-xs text-gray-500 truncate">View Profile</p>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50 shrink-0"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
