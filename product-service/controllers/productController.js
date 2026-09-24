const productModel = require('../models/productModel');

// Controller untuk mengambil semua produk
async function getAllProducts(req, res) {
    try {
        const products = await productModel.getAllProducts();

        res.json({
            message: "Berhasil mengambil data produk",
            data: products
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil produk",
            error: error.message
        });
    }
}

// Controller untuk mengambil produk berdasarkan ID
async function getProductById(req, res) {
    try {
        const { id } = req.params;

        const product = await productModel.getProductById(id);

        if (!product) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        res.json({
            message: "Berhasil mengambil data produk",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil produk",
            error: error.message
        });
    }
}

// Controller untuk membuat produk baru
async function createProduct(req, res) {
    try {
        const { name, description, price, stock } = req.body;

        const product = await productModel.createProduct({
            name,
            description,
            price,
            stock
        });

        res.status(201).json({
            message: "Berhasil membuat produk",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal membuat produk",
            error: error.message
        });
    }
}

// Controller untuk mengupdate produk
async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;

        // Cek apakah produk tersedia
        const existingProduct = await productModel.getProductById(id);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        const product = await productModel.updateProduct(id, {
            name,
            description,
            price,
            stock
        });

        res.json({
            message: "Berhasil mengupdate produk",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengupdate produk",
            error: error.message
        });
    }
}

// Controller untuk menghapus produk
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;

        // Cek apakah produk tersedia
        const existingProduct = await productModel.getProductById(id);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        await productModel.deleteProduct(id);

        res.json({
            message: "Berhasil menghapus produk"
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal menghapus produk",
            error: error.message
        });
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};