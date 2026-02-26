import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import authService from '../../services/authService';

const Layout = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfileAndPrefs = async () => {
            try {
                const data = await authService.getProfile();
                if (data.success) {
                    setUser(data.user);
                }

                // Fetch System Preferences for global Dark Mode
                const API = (await import('../../utils/api')).default;
                const prefsRes = await API.get('/settings/preferences');
                if (prefsRes.data?.darkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (error) {
                console.error('Failed to fetch profile or preferences', error);
            }
        };

        fetchProfileAndPrefs();
    }, []);

    return (
        <div className="flex h-screen min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar user={user} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 ml-64 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
