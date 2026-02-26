import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import API from '../../utils/api';

const SystemPreferences = () => {
    const [formData, setFormData] = useState({
        darkMode: false,
        language: 'English',
        dateFormat: 'DD-MM-YYYY',
        timeZone: 'Asia/Kolkata',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const { data } = await API.get('/settings/preferences');
            setFormData({
                darkMode: data.darkMode || false,
                language: data.language || 'English',
                dateFormat: data.dateFormat || 'DD-MM-YYYY',
                timeZone: data.timeZone || 'Asia/Kolkata',
            });
            applyTheme(data.darkMode);
        } catch (error) {
            console.error('Error fetching preferences:', error);
            toast.error('Failed to load system preferences');
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        if (name === 'darkMode') {
            applyTheme(newValue);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.put('/settings/preferences', formData);
            toast.success('System preferences saved successfully');
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error(error.response?.data?.message || 'Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">System Preferences</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme for the dashboard</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="darkMode"
                                checked={formData.darkMode}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--color-brand-blue)]"></div>
                        </label>
                    </div>

                    {/* Language Dropdown */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Language</label>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]/50 focus:border-[var(--color-brand-blue)] outline-none transition-shadow text-sm text-gray-800 dark:text-gray-200"
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                        </select>
                    </div>

                    {/* Date Format Dropdown */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Date Format</label>
                        <select
                            name="dateFormat"
                            value={formData.dateFormat}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]/50 focus:border-[var(--color-brand-blue)] outline-none transition-shadow text-sm text-gray-800 dark:text-gray-200"
                        >
                            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                            <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                        </select>
                    </div>

                    {/* Time Zone Dropdown */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Time Zone</label>
                        <select
                            name="timeZone"
                            value={formData.timeZone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]/50 focus:border-[var(--color-brand-blue)] outline-none transition-shadow text-sm text-gray-800 dark:text-gray-200"
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata</option>
                            {/* Add other timezones if needed */}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-[var(--color-brand-blue)] hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 dark:shadow-[var(--color-brand-blue)]/30 transition-all flex items-center justify-center min-w-[160px] text-sm hover-mac-folder"
                    >
                        {saving ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            'Save Preferences'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SystemPreferences;
