import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'; // Adjust import based on installed icons

const CategoryManager = ({ isOpen, onClose, onUpdate }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await productService.getCategories();
            setCategories(data);
            setError('');
        } catch (err) {
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            await productService.createCategory({ name: newCategory });
            setNewCategory('');
            fetchCategories();
            onUpdate(); // Notify parent to refresh categories
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure? This might affect products using this category.')) return;
        try {
            await productService.deleteCategory(id);
            fetchCategories();
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete category');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">Manage Categories</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 border-b bg-gray-50">
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New Category Name"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-1" />
                            Add
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : (
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li key={cat._id} className="flex justify-between items-center p-3 bg-white border rounded-md hover:bg-gray-50 shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                        <span className="text-xs text-gray-400">{cat.productCount || 0} products</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCategory(cat._id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </li>
                            ))}
                            {categories.length === 0 && (
                                <li className="text-gray-500 text-center py-4">No categories found.</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
