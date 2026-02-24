import React from 'react';
import StoreSettings from '../components/settings/StoreSettings';

const Settings = () => {
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

            <StoreSettings />
        </div>
    );
};

export default Settings;
