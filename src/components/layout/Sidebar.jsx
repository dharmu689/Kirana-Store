import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_ITEMS } from '../../services/dummyData';
import clsx from 'clsx';
import { LogOut, User } from 'lucide-react';
import authService from '../../services/authService';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 shadow-sm z-50">
            {/* Brand Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-50">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-blue-200">
                    <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">Kirana<span className="text-blue-600">Pro</span></span>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                    const user = JSON.parse(localStorage.getItem('user'));
                    const isAdmin = user && user.role === 'admin';

                    // Hide Vendor Orders from non-admins
                    if (item.path === '/vendor-orders' && !isAdmin) {
                        return null;
                    }

                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon
                                size={20}
                                className={clsx(
                                    "mr-3 transition-colors",
                                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-gray-50">
                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User size={20} />
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">Store Manager</p>
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
