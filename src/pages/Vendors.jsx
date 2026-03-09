import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import vendorService from '../services/vendorService';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Vendors = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVendorId, setCurrentVendorId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Authentication/Role Check
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        if (isAdmin) {
            fetchVendors();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await vendorService.getVendors();
            setVendors(data);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
            alert('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (vendor = null) => {
        if (vendor) {
            setIsEditing(true);
            setCurrentVendorId(vendor._id);
            setFormData({
                name: vendor.name,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address
            });
        } else {
            setIsEditing(false);
            setCurrentVendorId(null);
            setFormData({ name: '', email: '', phone: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', address: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("API URL:", import.meta.env.VITE_API_URL);
        console.log("Submitting VendorData:", formData);

        try {
            if (isEditing) {
                await vendorService.updateVendor(currentVendorId, formData);
                alert('Vendor updated successfully');
            } else {
                await vendorService.addVendor(formData);
                alert('Vendor added successfully');
            }
            handleCloseModal();
            fetchVendors();
        } catch (error) {
            console.error('Failed to save vendor:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Error saving vendor');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                await vendorService.deleteVendor(id);
                alert('Vendor deleted successfully');
                fetchVendors();
            } catch (error) {
                console.error('Failed to delete vendor:', error);
                alert('Error deleting vendor. Ensure there are no pending orders for this vendor first.');
            }
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAdmin) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.vendors || "Vendor Management"}</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage suppliers, contacts, and delivery locations.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-[var(--color-brand-blue)] text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 dark:shadow-[var(--color-brand-blue)]/30 transition-all text-sm hover-mac-folder"
                    >
                        <Plus className="mr-2" size={16} />
                        {t.addVendor || "Add Vendor"}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-4 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-brand-blue)]" size={18} />
                    <input
                        type="text"
                        placeholder={t.searchVendors || "Search vendors by name or email..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-18 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)] text-sm font-medium bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    />
                </div>
            </div>

            {/* Vendor Table */}
            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t?.vendorName || "Vendor Name"}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t?.contactInfo || "Contact Info"}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t?.address || "Address"}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t?.actions || "Actions"}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading vendors...</td>
                                </tr>
                            ) : filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm">No vendors found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-gray-50 dark:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-blue-50 dark:bg-[var(--color-brand-blue)]/20 rounded-full flex items-center justify-center text-[var(--color-brand-blue)] font-bold text-lg border border-[var(--color-brand-blue)]/30">
                                                    {vendor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{vendor.email}</div>
                                            <div className="text-sm text-gray-500">{vendor.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">{vendor.address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(vendor)}
                                                className="text-[var(--color-brand-blue)] hover:text-blue-900 dark:hover:text-blue-400 mx-2 hover-mac-folder inline-block"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vendor._id)}
                                                className="text-[var(--color-brand-orange)] hover:text-red-600 mx-2 hover-mac-folder inline-block"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {/* {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={handleCloseModal}>
                            <div className="absolute inset-0 bg-gray-50 dark:bg-gray-8000 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
                                        </h3>
                                        <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor Name</label>
                                            <input type="text" name="name" id="name" required
                                                value={formData.name} onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                            <input type="email" name="email" id="email" required
                                                value={formData.email} onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                            <input type="tel" name="phone" id="phone" required
                                                value={formData.phone} onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Physical Address</label>
                                            <textarea name="address" id="address" rows="3" required
                                                value={formData.address} onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
                                        {isEditing ? 'Save Changes' : 'Create Vendor'}
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-900 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">

                    {/* Background Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={handleCloseModal}
                    ></div>

                    {/* Modal Box */}
                    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 z-50">

                        <form onSubmit={handleSubmit}>

                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {isEditing ? (t.editVendor || 'Edit Vendor') : (t.addNewVendor || 'Add New Vendor')}
                                </h3>

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Vendor Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Physical Address
                                    </label>
                                    <textarea
                                        name="address"
                                        rows="3"
                                        required
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                            </div>

                            {/* Footer Buttons */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 transition-colors font-medium text-sm"
                                >
                                    {t.cancel || 'Cancel'}
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[var(--color-brand-blue)] text-white hover:bg-[var(--color-brand-blue-hover)] transition-colors font-bold text-sm shadow-md"
                                >
                                    {isEditing ? (t.saveChanges || 'Save Changes') : (t.createVendor || 'Create Vendor')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Vendors;
