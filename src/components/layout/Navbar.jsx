import { Bell, Search, Menu, Moon, Sun, Globe, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';
import API from '../../utils/api';

const Navbar = ({ user, onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage } = useLanguage();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const notifRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await API.get('/notifications');
                if (res.data.success) {
                    setNotifications(res.data.notifications);
                    setUnreadCount(res.data.unreadCount);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        // Fetch initially
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <header className="h-16 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-40 lg:ml-64 transition-colors duration-300 shadow-sm w-full lg:w-auto">
            {/* Left Global Search */}
            <div className="flex items-center flex-1 lg:w-96 mr-4 lg:mr-0">
                <button
                    onClick={onMenuClick}
                    className="mr-3 lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Open Menu"
                >
                    <Menu size={24} />
                </button>
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 sm:text-sm transition-all duration-200"
                        placeholder={translations[language]?.search || 'Search'}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">

                {/* Language Toggle */}
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                </select>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title={theme === 'light' ? (translations[language]?.darkMode || 'Dark Mode') : (translations[language]?.lightMode || 'Light Mode')}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                    >
                        <Bell size={20} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 shadow-sm animate-pulse">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{translations[language]?.notifications || 'Notifications'}</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                                            className={`p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            <div className="shrink-0 mt-0.5">
                                                {!notif.isRead ? (
                                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                                                ) : (
                                                    <CheckCircle size={14} className="text-gray-400 dark:text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-sm ${!notif.isRead ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                                                    {new Date(notif.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                        <p className="text-sm">No notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user ? `${translations[language]?.welcome || 'Welcome'}, ${user.name}` : `${translations[language]?.welcome || 'Welcome'}, ${translations[language]?.guest || 'Guest'}`}
                    </span>
                    <span className="text-xs text-[var(--color-brand-blue)] dark:text-blue-300 font-bold bg-blue-50/80 dark:bg-[var(--color-brand-blue)]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-blue-100 dark:border-[var(--color-brand-blue)]/30">
                        {user ? user.role : (translations[language]?.offline || 'Offline')}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
