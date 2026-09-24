const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET semua produk
router.get('/', productController.getAllProducts);

// GET produk berdasarkan ID
router.get('/:id', productController.getProductById);

// POST membuat produk baru
router.post('/', productController.createProduct);

// PUT mengupdate produk berdasarkan ID
router.put('/:id', productController.updateProduct);

// DELETE menghapus produk berdasarkan ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;