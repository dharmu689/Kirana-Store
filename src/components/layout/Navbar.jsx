import { Bell, Search, Menu, Moon, Sun, Globe, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../utils/api';

const Navbar = ({ user }) => {
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();

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
        <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-40 ml-64 transition-colors">
            {/* Left Global Search */}
            <div className="flex items-center w-96">
                <button className="mr-4 lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <Menu size={24} />
                </button>
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 sm:text-sm transition-all duration-200"
                        placeholder={t('search')}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <Globe size={16} />
                    <span>{language === 'English' ? 'EN' : 'HI'}</span>
                </button>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title={theme === 'light' ? t('dark_mode') : t('light_mode')}
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
                                <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications')}</h3>
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
                        {user ? `${t('welcome')}, ${user.name}` : `${t('welcome')}, ${t('guest')}`}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase">
                        {user ? user.role : t('offline')}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
