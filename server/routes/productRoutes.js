const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProductById,
    getProductByBarcode,
    updateProduct,
    deleteProduct,
    adjustStock
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getProducts)
    .post(protect, admin, createProduct);

router.get('/barcode/:barcode', protect, getProductByBarcode);

router.route('/:id')
    .get(protect, getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

router.route('/:id/adjust')
    .put(protect, admin, adjustStock);

module.exports = router;
