const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get products needing reorder
// @route   GET /api/reorder
// @access  Private/Admin
const getReorderItems = asyncHandler(async (req, res) => {
    const Forecast = require('../models/Forecast');

    // Fetch all products
    const products = await Product.find().sort({ quantity: 1 });

    const reorderList = await Promise.all(products.map(async (product) => {
        const reorderLevel = product.reorderLevel || 0;
        const currentStock = product.quantity || 0;

        // Fetch predictedDemand from the Forecast collection
        const latestForecast = await Forecast.findOne({ product: product._id }).sort({ generatedAt: -1 });
        const predictedDemand = latestForecast ? latestForecast.predictedMonthlyDemand || 0 : 0;

        // Suggested Order Qty logic
        let suggestedOrderQty = Math.ceil(predictedDemand - currentStock);
        if (suggestedOrderQty < 0) {
            suggestedOrderQty = 0;
        }

        // Status logic
        let status = 'LOW_STOCK';
        if (currentStock === 0) {
            status = 'OUT_OF_STOCK';
        } else if (currentStock > reorderLevel && suggestedOrderQty === 0) {
            status = 'SAFE';
        }

        return {
            _id: product._id,
            name: product.name,
            quantity: currentStock,
            reorderLevel: reorderLevel,
            predictedDemand,
            suggestedOrderQty,
            status,
            supplierLeadTime: product.supplierLeadTime,
            lastSoldDate: product.lastSoldDate
        };
    }));

    // Filter products that actually need action
    const filteredList = reorderList.filter(item => item.suggestedOrderQty > 0 || item.quantity <= item.reorderLevel);

    res.json(filteredList);
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
