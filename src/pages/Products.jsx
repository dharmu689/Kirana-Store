import React, { useState, useEffect } from 'react';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import CategoryManager from '../components/CategoryManager';
import BarcodePreview from '../components/BarcodePreview';
import BarcodeGrid from '../components/BarcodeGrid';
import productService from '../services/productService';
import authService from '../services/authService';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Products = () => {
    const { language } = useLanguage();
    const t = translations[language];

    // Data State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Filter/Sort Configuration State
    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        status: '',
    });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [stockAdjustmentProduct, setStockAdjustmentProduct] = useState(null);
    const [latestProduct, setLatestProduct] = useState(null);
    const [isBarcodePreviewOpen, setIsBarcodePreviewOpen] = useState(false);

    // Bulk Print State
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isPrintingBulk, setIsPrintingBulk] = useState(false);

    // Initial Load
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        fetchCategories();
        // Initial fetch with default filters
        fetchProducts();
    }, []);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, sortConfig]);

    const fetchCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to categories', err);
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            // Construct query params
            const params = {
                keyword: filters.keyword,
                category: filters.category,
                status: filters.status,
                sort: `${sortConfig.direction === 'asc' ? '' : '-'}${sortConfig.key}`
            };

            const data = await productService.getProducts(params);
            setProducts(data);
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch products');
            setIsLoading(false);
        }
    };

    // Handlers
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = () => {
        setCurrentProduct(null);
        setIsProductModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setCurrentProduct(product);
        setIsProductModalOpen(true);
    };

    const handleAdjustStock = (product) => {
        setStockAdjustmentProduct(product);
        setIsStockModalOpen(true);
    };

    const handleDeleteProduct = async (product) => {
        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
            try {
                await productService.deleteProduct(product._id);
                fetchProducts(); // Refresh list
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    const handleProductSubmit = async (formData) => {
        try {
            if (currentProduct) {
                await productService.updateProduct(currentProduct._id, formData);
                fetchProducts();
                setIsProductModalOpen(false);
            } else {
                const response = await productService.createProduct(formData);
                fetchProducts();
                setIsProductModalOpen(false);
                // Trigger Barcode Preview Modal for newly created product
                // We assume response.product exists based on backend returning { success, product }
                if (response && response.product) {
                    setLatestProduct(response.product);
                    setIsBarcodePreviewOpen(true);
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save product');
        }
    };

    const handleStockAdjustmentSubmit = async (id, adjustment) => {
        try {
            await productService.adjustStock(id, adjustment);
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to adjust stock');
        }
    };

    // Import Handler
    const handleImportClick = () => {
        document.getElementById('import-file-input').click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            // Simple CSV parser: assuming header is row 0
            const rows = text.split('\n').map(row => row.split(','));
            const header = rows[0]; // Name, Category, Purchase Price, Selling Price, Unit, Quantity, Reorder Level, Expiry Date
            // Need robust parsing, but for demo simple:
            // Assume format: Name,Category,Purchase Price,Selling Price,Unit,Quantity,Reorder Level,Expiry Date

            let successCount = 0;
            let failCount = 0;

            // Start from index 1 (skip header)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length < 8) continue; // Skip empty/invalid

                const [name, category, purchasePrice, sellingPrice, unit, quantity, reorderLevel, expiryDate] = row;
                if (!name || !sellingPrice) continue;

                try {
                    await productService.createProduct({
                        name: name.trim(),
                        category: category?.trim() || 'Uncategorized',
                        purchasePrice: Number(purchasePrice) || 0,
                        sellingPrice: Number(sellingPrice),
                        price: Number(sellingPrice),
                        unit: unit?.trim() || 'piece',
                        quantity: Number(quantity) || 0,
                        reorderLevel: Number(reorderLevel) || 10,
                        expiryDate: (expiryDate && expiryDate.trim()) ? new Date(expiryDate.trim()) : null
                    });
                    successCount++;
                } catch (err) {
                    failCount++;
                    console.error('Failed to import row', row, err);
                }
            }
            alert(`Import finished. Success: ${successCount}, Failed: ${failCount}`);
            fetchProducts();
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset
    };

    // Sample CSV Export Handler
    const handleDownloadSampleCSV = () => {
        const headers = ['Name', 'Category', 'Purchase Price', 'Selling Price', 'Unit', 'Quantity', 'Reorder Level', 'Expiry Date'];
        const sampleRow = ['Sample Product', 'Snacks', '100', '150', 'piece', '25', '5', ''];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + sampleRow.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sample_product_import.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export Handler (Simple CSV)
    const handleExport = () => {
        const headers = ['Name', 'Category', 'Price', 'Quantity', 'Reorder Level', 'Status', 'Expiry'];
        const rows = products.map(p => [
            p.name,
            p.category,
            p.price,
            p.quantity,
            p.reorderLevel,
            p.status,
            p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">

            {/* Header & Quick Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t.products || "Products Inventory"}</h1>
                    <p className="text-gray-500 mt-1">{t?.manageStockDesc || "Manage stock, track expiry, and organize categories."}</p>
                </div>
                {user && user.role === 'admin' && (
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="file"
                            id="import-file-input"
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={handleDownloadSampleCSV}
                            className="flex items-center px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-[var(--color-brand-blue)] dark:text-blue-400 rounded-lg hover:bg-gray-50 dark:bg-gray-800 shadow-sm transition-all duration-300 hover-mac-folder text-sm font-medium"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> {t?.sampleCSV || "Sample CSV"}
                        </button>
                        <button
                            onClick={handleImportClick}
                            className="flex items-center px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:text-[var(--color-brand-blue)] hover:bg-gray-50 dark:bg-gray-800 shadow-sm transition-all duration-300 hover-mac-folder text-sm font-medium"
                        >
                            <ArrowUpTrayIcon className="h-4 w-4 mr-2" /> {t?.import || "Import"}
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:text-[var(--color-brand-blue)] hover:bg-gray-50 dark:bg-gray-800 shadow-sm transition-all duration-300 hover-mac-folder text-sm font-medium"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> {t?.export || "Export"}
                        </button>
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="flex items-center px-3 py-2 bg-[var(--color-brand-orange)]/10 dark:bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/20 text-[var(--color-brand-orange)] rounded-lg shadow-sm transition-all duration-300 hover-mac-folder text-sm font-bold"
                        >
                            <FolderIcon className="h-4 w-4 mr-2" /> {t?.categories || "Categories"}
                        </button>
                        {selectedProductIds.length > 0 && (
                            <button
                                onClick={() => setIsPrintingBulk(true)}
                                className="flex items-center px-4 py-2 bg-indigo-600 border border-transparent text-white rounded-lg shadow-sm transition-all duration-300 hover-mac-folder text-sm font-bold"
                            >
                                Print Selected Barcodes ({selectedProductIds.length})
                            </button>
                        )}
                        <button
                            onClick={handleAddProduct}
                            className="flex items-center px-4 py-2 bg-[var(--color-brand-blue)] text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 dark:shadow-[var(--color-brand-blue)]/30 transition-all text-sm hover-mac-folder"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" /> {t.addProduct}
                        </button>
                    </div>
                )}
            </div>

            {/* Metrics Summary (Optional, simple version) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">{t?.totalValue || "Total Value"}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ₹{products.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">{t?.totalProducts || "Total Products"}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{products.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">{t?.lowStockAlerts || "Low Stock Items"}</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {products.filter(p => p.status === 'LOW_STOCK').length}
                    </p>
                </div>
            </div>

            {/* Detailed Filters & Search */}
            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-[var(--color-brand-blue)]" />
                    </div>
                    <input
                        type="text"
                        name="keyword"
                        value={filters.keyword}
                        onChange={handleFilterChange}
                        placeholder={t?.search || "Search products by name, SKU, or category..."}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                    >
                        <option value="">{t.allCategories || "All Categories"}</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                    >
                        <option value="">{t?.allStatuses || "All Statuses"}</option>
                        <option value="IN_STOCK">{t?.inStock || "In Stock"}</option>
                        <option value="LOW_STOCK">{t?.lowStock || "Low Stock"}</option>
                        <option value="OUT_OF_STOCK">{t?.outOfStock || "Out of Stock"}</option>
                    </select>
                </div>
            </div>

            {/* Error & Loading */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center print:hidden">
                    <span className="font-medium mr-2">Error:</span> {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12 print:hidden">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="print:hidden">
                    <ProductTable
                        products={products}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onAdjustStock={handleAdjustStock}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                        user={user}
                        selectedIds={selectedProductIds}
                        onSelectProduct={(id) => {
                            setSelectedProductIds(prev =>
                                prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
                            );
                        }}
                        onSelectAll={(selectAll) => {
                            if (selectAll) {
                                setSelectedProductIds(products.map(p => p._id));
                            } else {
                                setSelectedProductIds([]);
                            }
                        }}
                    />
                </div>
            )}

            {/* Hidden component for actual printing */}
            {isPrintingBulk && (
                <BarcodeGrid
                    products={products.filter(p => selectedProductIds.includes(p._id))}
                    printTrigger={isPrintingBulk}
                    onPrintComplete={() => setIsPrintingBulk(false)}
                />
            )}

            {/* Modals */}
            <ProductForm
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={handleProductSubmit}
                initialData={currentProduct}
                categories={categories} // Pass categories to form if needed/updated
            />

            <StockAdjustmentModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onSubmit={handleStockAdjustmentSubmit}
                product={stockAdjustmentProduct}
            />

            <CategoryManager
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onUpdate={fetchCategories}
            />

            <BarcodePreview
                isOpen={isBarcodePreviewOpen}
                onClose={() => setIsBarcodePreviewOpen(false)}
                product={latestProduct}
            />
        </div>
    );
};

export default Products;
