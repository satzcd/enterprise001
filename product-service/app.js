const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '3mb' }));

// Endpoint untuk health check
app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        service: "product-service"
    });
});

// Endpoint product
app.use('/products', productRoutes);

app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
        return res.status(400).json({
            message: "Request body terlalu besar"
        });
    }

    next(error);
});

// Unknown path
app.use((req, res) => {
    res.status(404).json({
        message: "Endpoint tidak dikenal"
    });
});

module.exports = app;