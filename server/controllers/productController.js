const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const QRCode = require('qrcode');

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, category, price, quantity, reorderLevel, expiryDate, supplierLeadTime, purchasePrice, sellingPrice, margin } = req.body;

    // Generate unique productId like PROD-0001
    const lastProduct = await Product.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let newProductId = 'PROD-0001';

    if (lastProduct && lastProduct.productId && lastProduct.productId.startsWith('PROD-')) {
        const lastSequence = parseInt(lastProduct.productId.split('-')[1]);
        if (!isNaN(lastSequence)) {
            newProductId = `PROD-${String(lastSequence + 1).padStart(4, '0')}`;
        }
    }

    const product = await Product.create({
        productId: newProductId,
        barcode: newProductId, // using productId as barcode content
        name,
        category,
        price,
        purchasePrice,
        sellingPrice,
        margin,
        quantity,
        reorderLevel,
        expiryDate,
        supplierLeadTime,
        createdBy: req.user._id
    });

    // Generate QR Code containing product details
    const qrData = JSON.stringify({
        productId: product._id,
        name: product.name,
        sellingPrice: product.sellingPrice || product.price
    });
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Save QR Code to the product
    product.qrCode = qrCodeImage;
    await product.save();

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
    });
});

// @desc    Get all products with Search, Filter, Sort, Pagination
// @route   GET /api/products
// @access  Public/Private
const getProducts = asyncHandler(async (req, res) => {
    const { keyword, category, status, sort, page = 1, limit = 100 } = req.query; // Default limit 100 for now

    // 1. Filter: Keyword (Name or Category)
    let query = {};

    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { category: { $regex: keyword, $options: 'i' } }
        ];
    }

    // 2. Filter: Category (Exact match)
    if (category) {
        query.category = category;
    }

    // 3. Filter: Status logic (calculated on the fly in basic version, here we can pre-filter if fields exist, 
    // but calculating 'LOW_STOCK' via query is complex because it depends on reorderLevel per document.
    // For 'OUT_OF_STOCK' it is simple: quantity === 0.
    // For 'LOW_STOCK', we allowed basic filtering below. 
    // True complex status filtering usually requires aggregation pipeline, but we will try basic method first.

    if (status === 'OUT_OF_STOCK') {
        query.quantity = 0;
    } else if (status === 'LOW_STOCK') {
        // This finds documents where quantity <= reorderLevel. 
        // Mongoose/Mongo supports $expr to compare fields.
        query.$expr = { $lte: ["$quantity", "$reorderLevel"] };
        // Exclude out of stock from low stock if desired, but user req say <= reorderLevel.
        // Usually low stock implies > 0, so lets add that to strict definition if needed.
        // query.quantity = { $gt: 0 }; 
    }

    // 4. Sort
    let sortOption = { createdAt: -1 }; // Default new to old
    if (sort) {
        // e.g. sort=price (asc), sort=-price (desc)
        const sortFields = sort.split(',').join(' ');

        // Convert to object for certain usages if needed, or pass string to mongoose
        // Mongoose .sort() accepts string "field -field"
        sortOption = sortFields;
    }

    // 5. Query Execution
    const products = await Product.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(Number(limit));

    // 6. Post-processing for calculating status string (for UI badges)
    const productsWithStatus = products.map(product => {
        let currentStatus = 'IN_STOCK';
        if (product.quantity === 0) {
            currentStatus = 'OUT_OF_STOCK';
        } else if (product.quantity <= product.reorderLevel) {
            currentStatus = 'LOW_STOCK';
        }

        return {
            ...product.toObject(),
            status: currentStatus
        };
    });

    res.json(productsWithStatus);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public/Private
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        let status = 'IN_STOCK';
        if (product.quantity === 0) {
            status = 'OUT_OF_STOCK';
        } else if (product.quantity <= product.reorderLevel) {
            status = 'LOW_STOCK';
        }
        res.json({
            ...product.toObject(),
            status
        });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get single product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Public/Private
const getProductByBarcode = asyncHandler(async (req, res) => {
    // Find by either barcode field or productId field for safety
    const product = await Product.findOne({
        $or: [
            { barcode: req.params.barcode },
            { productId: req.params.barcode }
        ]
    });

    if (product) {
        let status = 'IN_STOCK';
        if (product.quantity === 0) {
            status = 'OUT_OF_STOCK';
        } else if (product.quantity <= product.reorderLevel) {
            status = 'LOW_STOCK';
        }
        res.json({
            ...product.toObject(),
            status
        });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        price,
        purchasePrice,
        sellingPrice,
        margin,
        quantity,
        reorderLevel,
        expiryDate,
        supplierLeadTime,
        totalSold,
        revenue
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.category = category || product.category;
        product.price = price !== undefined ? price : product.price; // Allow 0
        if (purchasePrice !== undefined) product.purchasePrice = purchasePrice;
        if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
        if (margin !== undefined) product.margin = margin;
        product.quantity = quantity !== undefined ? quantity : product.quantity;
        product.reorderLevel = reorderLevel !== undefined ? reorderLevel : product.reorderLevel;
        product.expiryDate = expiryDate || product.expiryDate;
        product.supplierLeadTime = supplierLeadTime !== undefined ? supplierLeadTime : product.supplierLeadTime;

        // Manual update of metrics if needed
        if (totalSold !== undefined) product.totalSold = totalSold;
        if (revenue !== undefined) product.revenue = revenue;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Adjust stock quantity
// @route   PUT /api/products/:id/adjust
// @access  Private/Admin
const adjustStock = asyncHandler(async (req, res) => {
    const { adjustment } = req.body; // +ve for add, -ve for deduct
    const product = await Product.findById(req.params.id);

    if (product) {
        const newQuantity = product.quantity + Number(adjustment);

        if (newQuantity < 0) {
            res.status(400);
            throw new Error('Stock cannot go below zero');
        }

        product.quantity = newQuantity;
        constupdatedProduct = await product.save();

        res.json({
            success: true,
            newQuantity: product.quantity,
            message: 'Stock adjusted successfully'
        });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    getProductByBarcode,
    updateProduct,
    deleteProduct,
    adjustStock
};
