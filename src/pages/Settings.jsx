import React, { useState } from 'react';
import StoreSettings from '../components/settings/StoreSettings';
import AccountSettings from '../components/settings/AccountSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SystemPreferences from '../components/settings/SystemPreferences';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Settings</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">
                        Manage your store configuration and preferences
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap">
                <button
                    className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'account'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('account')}
                >
                    Account Profile
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'notifications'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notification Preferences
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'store'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('store')}
                >
                    Store Settings
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'system'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
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
