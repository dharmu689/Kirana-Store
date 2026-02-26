import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiLoader, FiBell } from 'react-icons/fi';

const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div className="pr-4">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</h3>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-900 shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    </div>
);

const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        enableEmailNotifications: true,
        lowStockAlerts: true,
        vendorOrderAlerts: true,
        forecastAlerts: true,
        notificationEmail: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await API.get('/settings/notifications');
            if (data) {
                setSettings({
                    enableEmailNotifications: data.enableEmailNotifications ?? true,
                    lowStockAlerts: data.lowStockAlerts ?? true,
                    vendorOrderAlerts: data.vendorOrderAlerts ?? true,
                    forecastAlerts: data.forecastAlerts ?? true,
                    notificationEmail: data.notificationEmail || '',
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch notification settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await API.put('/settings/notifications', settings);

            setSettings((prev) => ({
                ...prev,
                enableEmailNotifications: data.enableEmailNotifications ?? true,
                lowStockAlerts: data.lowStockAlerts ?? true,
                vendorOrderAlerts: data.vendorOrderAlerts ?? true,
                forecastAlerts: data.forecastAlerts ?? true,
                notificationEmail: data.notificationEmail || '',
            }));

            toast.success('Notification settings updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update notification settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100">
                <FiLoader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 dark:text-gray-200 gap-2">
                <FiBell className="text-indigo-600" />
                Notification Preferences
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">

                    {/* Email Settings Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Delivery Settings</h3>

                        <ToggleSwitch
                            label="Enable Email Notifications"
                            description="Receive alert notifications via Email"
                            checked={settings.enableEmailNotifications}
                            onChange={() => handleToggle('enableEmailNotifications')}
                        />

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className={`block text-sm font-medium mb-1 ${settings.enableEmailNotifications ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                                Notification Email Address
                            </label>
                            <input
                                type="email"
                                name="notificationEmail"
                                value={settings.notificationEmail}
                                onChange={handleChange}
                                disabled={!settings.enableEmailNotifications}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-50 dark:bg-gray-800 disabled:text-gray-400"
                                placeholder="alerts@yourstore.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave blank to use the store's primary email address for notifications.
                            </p>
                        </div>
                    </div>

                    {/* Alert Types Section */}
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Alert Types</h3>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 space-y-1">
                            <ToggleSwitch
                                label="Low Stock Alerts"
                                description="Be notified when items fall below safety stock"
                                checked={settings.lowStockAlerts}
                                onChange={() => handleToggle('lowStockAlerts')}
                            />
                            <ToggleSwitch
                                label="Vendor Order Alerts"
                                description="Notifications for placed, delayed, or received orders"
                                checked={settings.vendorOrderAlerts}
                                onChange={() => handleToggle('vendorOrderAlerts')}
                            />
                            <ToggleSwitch
                                label="Forecast Alerts"
                                description="Get updates on high-demand and trending items"
                                checked={settings.forecastAlerts}
                                onChange={() => handleToggle('forecastAlerts')}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-800 font-medium transition-colors"
                        onClick={() => fetchSettings()}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-medium flex items-center justify-center gap-2 transition-colors min-w-[120px]"
                    >
                        {saving ? (
                            <FiLoader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <FiSave className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NotificationSettings;
