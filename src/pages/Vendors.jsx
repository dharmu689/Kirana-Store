import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import vendorService from '../services/vendorService';

const Vendors = () => {
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
            console.error('Failed to save vendor:', error);
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
                <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage suppliers, contacts, and delivery locations.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm shadow-md hover:bg-blue-700 transition"
                    >
                        <Plus className="mr-2" size={16} />
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search vendors by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Vendor Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact Info
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Address
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
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
                                    <tr key={vendor._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {vendor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{vendor.email}</div>
                                            <div className="text-sm text-gray-500">{vendor.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">{vendor.address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(vendor)}
                                                className="text-indigo-600 hover:text-indigo-900 mx-2"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vendor._id)}
                                                className="text-red-600 hover:text-red-900 mx-2"
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={handleCloseModal}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
                                        </h3>
                                        <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Vendor Name</label>
                                            <input type="text" name="name" id="name" required
                                                value={formData.name} onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                            <input type="email" name="email" id="email" required
                                                value={formData.email} onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                            <input type="tel" name="phone" id="phone" required
                                                value={formData.phone} onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Physical Address</label>
                                            <textarea name="address" id="address" rows="3" required
                                                value={formData.address} onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
                                        {isEditing ? 'Save Changes' : 'Create Vendor'}
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;
