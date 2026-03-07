import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ManualSearch = ({ products, onSelectProduct }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Filter products based on search query
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            (p.productId && p.productId.toLowerCase().includes(lowerQuery)) ||
            (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
        ).slice(0, 10); // Limit to top 10 suggestions

        setSuggestions(filtered);
    }, [query, products]);

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (product) => {
        onSelectProduct(product);
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className="w-full" ref={wrapperRef}>
            <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search product name, ID, or barcode..."
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-indigo-200 dark:border-indigo-900/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 bg-white dark:bg-gray-800 font-medium shadow-sm"
                />
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full md:w-[40%] max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-80 overflow-y-auto">
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {suggestions.map((product) => (
                            <li
                                key={product._id}
                                onClick={() => handleSelect(product)}
                                className={`p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 cursor-pointer flex justify-between items-center transition-colors ${product.quantity <= 0 ? 'opacity-50' : ''}`}
                            >
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{product.name}</h4>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{product.productId} | stock: {product.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">₹{product.sellingPrice || product.price}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isOpen && query.trim() && suggestions.length === 0 && (
                <div className="absolute z-50 w-full md:w-[40%] max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 text-center text-gray-500">
                    No products found matching "{query}"
                </div>
            )}
        </div>
    );
};

export default ManualSearch;
