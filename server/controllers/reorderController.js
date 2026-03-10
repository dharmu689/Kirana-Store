const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get products needing reorder
// @route   GET /api/reorder
// @access  Private/Admin
const getReorderItems = asyncHandler(async (req, res) => {
    const mongoose = require('mongoose');

    // Efficiently aggregate products and map Forecast data in a single MongoDB operation
    const products = await Product.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
        {
            $lookup: {
                from: 'forecasts',
                let: { productId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$product', '$$productId'] } } },
                    { $sort: { generatedAt: -1 } },
                    { $limit: 1 }
                ],
                as: 'latestForecast'
            }
        },
        { $unwind: { path: '$latestForecast', preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                predictedDemand: { $ifNull: ['$latestForecast.predictedMonthlyDemand', 0] },
                suggestedOrderQty: {
                    $max: [
                        0,
                        { $ceil: { $subtract: [{ $ifNull: ['$latestForecast.predictedMonthlyDemand', 0] }, { $ifNull: ['$quantity', 0] }] } }
                    ]
                }
            }
        },
        {
            $match: {
                $expr: {
                    $or: [
                        { $gt: ['$suggestedOrderQty', 0] },
                        { $lte: [{ $ifNull: ['$quantity', 0] }, { $ifNull: ['$reorderLevel', 0] }] }
                    ]
                }
            }
        },
        {
            $addFields: {
                status: {
                    $cond: {
                        if: { $lte: [{ $ifNull: ['$quantity', 0] }, 0] },
                        then: 'OUT_OF_STOCK',
                        else: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gt: [{ $ifNull: ['$quantity', 0] }, { $ifNull: ['$reorderLevel', 0] }] },
                                        { $eq: ['$suggestedOrderQty', 0] }
                                    ]
                                },
                                then: 'SAFE',
                                else: 'LOW_STOCK'
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                quantity: { $ifNull: ['$quantity', 0] },
                reorderLevel: { $ifNull: ['$reorderLevel', 0] },
                predictedDemand: 1,
                suggestedOrderQty: 1,
                status: 1,
                supplierLeadTime: 1,
                lastSoldDate: 1
            }
        },
        { $sort: { quantity: 1 } }
    ]);

    res.json(products);
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

    const product = await Product.findOne({ _id: req.params.id, userId: req.user.id });

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
