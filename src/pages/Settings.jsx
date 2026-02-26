import React, { useState } from 'react';
import StoreSettings from '../components/settings/StoreSettings';
import AccountSettings from '../components/settings/AccountSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SystemPreferences from '../components/settings/SystemPreferences';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Settings = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const [activeTab, setActiveTab] = useState('account');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">{t?.settings || "Settings"}</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">
                        Manage your store configuration and preferences
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap gap-4 px-2">
                <button
                    className={`py-3 px-4 font-semibold text-sm transition-all rounded-t-xl ${activeTab === 'account'
                        ? 'bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] border-b-2 border-[var(--color-brand-blue)]'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    onClick={() => setActiveTab('account')}
                >
                    Account Profile
                </button>
                <button
                    className={`py-3 px-4 font-semibold text-sm transition-all rounded-t-xl ${activeTab === 'notifications'
                        ? 'bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] border-b-2 border-[var(--color-brand-blue)]'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notification Preferences
                </button>
                <button
                    className={`py-3 px-4 font-semibold text-sm transition-all rounded-t-xl ${activeTab === 'store'
                        ? 'bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] border-b-2 border-[var(--color-brand-blue)]'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    onClick={() => setActiveTab('store')}
                >
                    Store Settings
                </button>
                <button
                    className={`py-3 px-4 font-semibold text-sm transition-all rounded-t-xl ${activeTab === 'system'
                        ? 'bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] border-b-2 border-[var(--color-brand-blue)]'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    onClick={() => setActiveTab('system')}
                >
                    System Preferences
                </button>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'account' && <AccountSettings />}
                {activeTab === 'notifications' && <NotificationSettings />}
                {activeTab === 'store' && <StoreSettings />}
                {activeTab === 'system' && <SystemPreferences />}
            </div>
        </div>
    );
};

export default Settings;
