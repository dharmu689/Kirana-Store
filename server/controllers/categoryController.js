const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product'); // Need Product model for aggregation

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({
        name,
        description
    });

    res.status(201).json(category);
});

// @desc    Get all categories with product count
// @route   GET /api/categories
// @access  Public/Private
const getCategories = asyncHandler(async (req, res) => {
    // Use aggregation to count products per category
    const categories = await Category.aggregate([
        {
            $lookup: {
                from: 'products', // Collection name in MongoDB (usually lowercase plural)
                localField: 'name', // Using Name as the link since Product stores category name string
                foreignField: 'category',
                as: 'products'
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                productCount: { $size: '$products' }
            }
        },
        { $sort: { name: 1 } }
    ]);

    res.json(categories);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};
