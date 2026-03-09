const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get products needing reorder
// @route   GET /api/reorder
// @access  Private/Admin
const getReorderItems = asyncHandler(async (req, res) => {
    // Fetch all products
    // Filter products where quantity <= reorderLevel
    // Note: We can filter in DB for efficiency
    const products = await Product.find({
        $expr: { $lte: ["$quantity", "$reorderLevel"] }
    }).sort({ quantity: 1 });

    const reorderList = products.map(product => {
        const reorderLevel = product.reorderLevel || 0;
        const quantity = product.quantity || 0;

        // Use AI predicted demand instead of raw reorder safety stocks
        const predictedDemand = product.latestPredictedDemand || 0;

        // Suggested Order Qty logic (Formula 4 API)
        let suggestedOrderQty = predictedDemand - quantity;
        if (suggestedOrderQty < 0) suggestedOrderQty = 0;

        // Status logic
        let status = 'LOW_STOCK';
        if (quantity === 0) {
            status = 'OUT_OF_STOCK';
        }

        return {
            _id: product._id,
            name: product.name,
            quantity: quantity,
            reorderLevel: reorderLevel,
            predictedDemand: predictedDemand,
            suggestedOrderQty,
            status,
            // Keeping these as they might be useful
            supplierLeadTime: product.supplierLeadTime,
            lastSoldDate: product.lastSoldDate
        };
    });

    res.json(reorderList);
});

// @desc    Restock product
// @route   PUT /api/reorder/restock/:id
// @access  Private/Admin
const restockProduct = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const qtyToAdd = Number(quantity);

    if (!qtyToAdd || qtyToAdd <= 0) {
        res.status(400);
        throw new Error('Please provide a valid quantity to restock');
    }

    const product = await Product.findById(req.params.id);

    if (product) {
        product.quantity += qtyToAdd;
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getReorderItems,
    restockProduct
};
