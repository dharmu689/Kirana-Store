import React, { useState, useEffect } from 'react';
import {
    PencilIcon,
    TrashIcon,
    ArrowsUpDownIcon,
    EllipsisVerticalIcon,
    ArchiveBoxArrowDownIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import JsBarcode from 'jsbarcode';

const ProductTable = ({ products, onEdit, onDelete, onAdjustStock, user, onSort, sortConfig }) => {
    const isAdmin = user && user.role === 'admin';
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const { language } = useLanguage();
    const t = translations[language];

    useEffect(() => {
        products.forEach(product => {
            if (product.barcode) {
                try {
                    JsBarcode(`#barcode-${product._id}`, product.barcode, {
                        format: "CODE128",
                        width: 1.5,
                        height: 40,
                        displayValue: true,
                        fontSize: 12,
                        margin: 0
                    });
                } catch (e) {
                    console.error("Failed to render barcode", e);
                }
            }
        });
    }, [products]);

    const handleDownloadBarcode = (product) => {
        const svgElement = document.getElementById(`barcode-${product._id}`);
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width + 20;
            canvas.height = img.height + 20;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 10, 10);

            const pngFile = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.download = `Barcode-${product.productId || product.name}.png`;
            a.href = pngFile;
            a.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        setOpenDropdownId(null);
    };

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OUT_OF_STOCK':
                return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2.5 py-0.5 rounded border border-red-200 dark:border-red-800/50">{t?.outOfStock || "Out of Stock"}</span>;
            case 'LOW_STOCK':
                return <span className="bg-orange-100 text-[var(--color-brand-orange)] dark:bg-[var(--color-brand-orange)]/20 text-xs font-bold px-2.5 py-0.5 rounded border border-orange-200 dark:border-[var(--color-brand-orange)]/30">{t?.lowStock || "Low Stock"}</span>;
            case 'IN_STOCK':
            default:
                return <span className="bg-green-100 text-[var(--color-brand-green)] dark:bg-[var(--color-brand-green)]/20 text-xs font-bold px-2.5 py-0.5 rounded border border-green-200 dark:border-[var(--color-brand-green)]/30">{t?.inStock || "In Stock"}</span>;
        }
    };

    const getExpiryStyle = (dateString) => {
        if (!dateString) return 'text-gray-500';
        const expiryDate = new Date(dateString);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'text-red-600 font-bold'; // Expired
        if (diffDays <= 7) return 'text-red-500 font-semibold'; // Critical
        if (diffDays <= 30) return 'text-yellow-600 font-medium'; // Warning
        return 'text-green-600'; // Safe
    };

    const SortableHeader = ({ label, sortKey }) => (
        <th
            scope="col"
            className="py-3 px-6 cursor-pointer hover:bg-gray-100 dark:bg-gray-800 transition-colors"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center space-x-1">
                <span>{label}</span>
                <ArrowsUpDownIcon className={`h-4 w-4 ${sortConfig?.key === sortKey ? 'text-[var(--color-brand-blue)]' : 'text-gray-400'}`} />
            </div>
        </th>
    );

    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg min-h-[400px]">
            <table className="min-w-full w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800 border-b">
                    <tr>
                        <th scope="col" className="py-3 px-6">ID / Barcode</th>
                        <SortableHeader label={t?.productName || "Product Name"} sortKey="name" />
                        <SortableHeader label={t?.category || "Category"} sortKey="category" />
                        <SortableHeader label={t?.price || "Price"} sortKey="price" />
                        <th scope="col" className="py-3 px-6">{t?.profit || "Profit"}</th>
                        <SortableHeader label={t?.stock || "Stock"} sortKey="quantity" />
                        <th scope="col" className="py-3 px-6">{t?.value || "Value"}</th>
                        <th scope="col" className="py-3 px-6">{t?.status || "Status"}</th>
                        <SortableHeader label={t?.sold || "Sold"} sortKey="totalSold" />
                        <th scope="col" className="py-3 px-6">{t?.revenue || "Revenue"}</th>
                        <SortableHeader label={t?.expiry || "Expiry"} sortKey="expiryDate" />
                        {isAdmin && <th scope="col" className="py-3 px-6 text-center">{t?.actions || "Actions"}</th>}
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr className="bg-white dark:bg-gray-900 border-b hover:bg-gray-50 dark:bg-gray-800">
                            <td colSpan={isAdmin ? 11 : 10} className="py-12 px-6 text-center text-gray-400">
                                {t?.noProductsFound || "No products found matching criteria"}
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product._id} className="bg-white dark:bg-gray-900 border-b hover:bg-gray-50 dark:bg-gray-800">
                                <td className="py-4 px-6">
                                    {product.barcode ? (
                                        <div className="bg-white p-1 rounded inline-block">
                                            <svg id={`barcode-${product._id}`} className="max-w-[120px] max-h-[50px]"></svg>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">No Barcode</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                    <div>{product.name}</div>
                                    {product.productId && <div className="text-xs text-gray-500 mt-1">{product.productId}</div>}
                                </td>
                                <td className="py-4 px-6">{product.category}</td>
                                <td className="py-4 px-6">₹{(product.sellingPrice || product.price)}</td>
                                <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">₹{product.profitPerUnit || 0}</td>
                                <td className="py-4 px-6 font-semibold">{product.quantity}</td>
                                <td className="py-4 px-6">₹{((product.sellingPrice || product.price) * product.quantity).toLocaleString()}</td>
                                <td className="py-4 px-6">{getStatusBadge(product.status)}</td>
                                <td className="py-4 px-6">{product.totalSold || 0}</td>
                                <td className="py-4 px-6">₹{(product.revenue || 0).toLocaleString()}</td>
                                <td className={`py-4 px-6 ${getExpiryStyle(product.expiryDate)}`}>
                                    {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                                </td>
                                {isAdmin && (
                                    <td className="py-4 px-6 text-center relative">
                                        <button
                                            onClick={() => toggleDropdown(product._id)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 focus:outline-none p-1 rounded-full hover:bg-gray-100 dark:bg-gray-800"
                                        >
                                            <EllipsisVerticalIcon className="h-5 w-5" />
                                        </button>

                                        {openDropdownId === product._id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => { setOpenDropdownId(null); onEdit(product); }}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 w-full text-left"
                                                    >
                                                        <PencilIcon className="h-4 w-4 mr-2" /> {t?.edit || "Edit"}
                                                    </button>
                                                    {product.barcode && (
                                                        <button
                                                            onClick={() => handleDownloadBarcode(product)}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 w-full text-left"
                                                        >
                                                            <QrCodeIcon className="h-4 w-4 mr-2" /> Download Barcode
                                                        </button>
                                                    )}
                                                    {product.qrCode && (
                                                        <a
                                                            href={product.qrCode}
                                                            download={`QR-${product.name}.png`}
                                                            onClick={() => setOpenDropdownId(null)}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 w-full text-left"
                                                        >
                                                            <QrCodeIcon className="h-4 w-4 mr-2" /> {t?.downloadQR || "Download QR"}
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => { setOpenDropdownId(null); onAdjustStock(product); }}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 w-full text-left"
                                                    >
                                                        <ArchiveBoxArrowDownIcon className="h-4 w-4 mr-2" /> {t?.adjustStock || "Adjust Stock"}
                                                    </button>
                                                    <button
                                                        onClick={() => { setOpenDropdownId(null); onDelete(product); }}
                                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                    >
                                                        <TrashIcon className="h-4 w-4 mr-2" /> {t?.delete || "Delete"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {/* Overlay to close dropdown on click outside */}
                                        {openDropdownId === product._id && (
                                            <div
                                                className="fixed inset-0 z-0 bg-transparent"
                                                onClick={() => setOpenDropdownId(null)}
                                            ></div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
