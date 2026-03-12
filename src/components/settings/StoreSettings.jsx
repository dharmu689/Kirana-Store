import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiLoader } from 'react-icons/fi';

const StoreSettings = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [settings, setSettings] = useState({
        storeName: '',
        phone: '',
        email: '',
        gstNumber: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await API.get('/settings/store');
            if (data && Object.keys(data).length > 0) {
                setSettings({
                    storeName: data.storeName || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    gstNumber: data.gstNumber || '',
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch store settings');
        } finally {
            setLoading(false);
        }
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
            const { data } = await API.put('/settings/store', settings);
            toast.success('Store settings updated successfully');
            setSettings({
                storeName: data.storeName || '',
                phone: data.phone || '',
                email: data.email || '',
                gstNumber: data.gstNumber || '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update store settings');
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
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-medium mb-4 mt-2 text-gray-800 dark:text-gray-200">
                Store Settings
            </h3>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Store Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="storeName"
                            value={settings.storeName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter store name"
                        />
                    </div>

                    {/* GST Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            GST Number <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={settings.gstNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter GST Number (optional)"
                        />
                    </div>
                </div>

                <hr className="my-8 border-gray-200 dark:border-gray-700" />

                <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
                    Owner Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Owner Name (Auto Filled) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Owner Name
                        </label>
                        <input
                            type="text"
                            value={user?.name || ''}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed transition-colors"
                        />
                    </div>

                    {/* Email (Auto Filled) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed transition-colors"
                        />
                    </div>

                    {/* Store Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Store Email <span className="text-sm text-indigo-500 font-normal">(used for vendor emails)</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={settings.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter store contact email"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={settings.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter phone number"
                        />
                    </div>

                </div>

                <div className="mt-6 flex justify-end gap-3">
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

export default StoreSettings;
