import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiLoader } from 'react-icons/fi';

const StoreSettings = () => {
    const [settings, setSettings] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        gstNumber: '',
        currency: '₹',
        logo: '',
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
                    ownerName: data.ownerName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    gstNumber: data.gstNumber || '',
                    currency: data.currency || '₹',
                    logo: data.logo || '',
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
                ownerName: data.ownerName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                gstNumber: data.gstNumber || '',
                currency: data.currency || '₹',
                logo: data.logo || '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update store settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
                <FiLoader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                Store Configuration
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Store Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="storeName"
                            value={settings.storeName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter store name"
                        />
                    </div>

                    {/* Owner Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Owner Name
                        </label>
                        <input
                            type="text"
                            name="ownerName"
                            value={settings.ownerName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter owner name"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={settings.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="store@example.com"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={settings.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter phone number"
                        />
                    </div>

                    {/* GST Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GST Number
                        </label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={settings.gstNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter GST Number"
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency Symbol
                        </label>
                        <input
                            type="text"
                            name="currency"
                            value={settings.currency}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="e.g., ₹, $, €"
                        />
                    </div>

                    {/* Logo URL */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logo URL
                        </label>
                        <input
                            type="text"
                            name="logo"
                            value={settings.logo}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="https://example.com/logo.png"
                        />
                        {settings.logo && (
                            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex justify-center">
                                <img
                                    src={settings.logo}
                                    alt="Store Logo Preview"
                                    className="max-h-24 object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                        e.target.style.display = 'block';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Store Address
                        </label>
                        <textarea
                            name="address"
                            value={settings.address}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                            placeholder="Enter full store address"
                        ></textarea>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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
