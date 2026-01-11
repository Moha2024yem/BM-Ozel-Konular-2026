const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const logger = require('../lib/logger');

/*
  GET /api/products
  Ürünleri listeler
 */
router.get('/', async (req, res) => {
    try {
        const { page, limit, isActive, trackInventory } = req.query;
        const result = await productService.listProducts({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
            trackInventory: trackInventory !== undefined ? trackInventory === 'true' : undefined
        });

        res.json(result);
    } catch (error) {
        logger.error('Error listing products', { error: error.message });
        res.status(500).json({ error: 'Failed to list products' });
    }
});

/*
  GET /api/products/:id
 Belirli bir ürünü getirir
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (error) {
        logger.error('Error fetching product', { error: error.message, productId: req.params.id });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

/*
  POST /api/products
 Yeni ürün oluşturur
 */
router.post('/', async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        logger.error('Error creating product', { error: error.message });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message, field: error.field });
    }
});

/*
  PUT /api/products/:id
  Ürünü günceller
 */
router.put('/:id', async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.json(product);
    } catch (error) {
        logger.error('Error updating product', { error: error.message, productId: req.params.id });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message, field: error.field });
    }
});

/*
  DELETE /api/products/:id
 Ürünü siler (soft delete)
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = await productService.deleteProduct(req.params.id);
        res.json(result);
    } catch (error) {
        logger.error('Error deleting product', { error: error.message, productId: req.params.id });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

/*
  PUT /api/products/:id/stock
  Stok miktarını günceller
  Body: { quantity: number, operation: 'add' | 'subtract' }
 */
router.put('/:id/stock', async (req, res) => {
    try {
        const { quantity, operation } = req.body;
        const product = await productService.updateStock(
            req.params.id,
            parseInt(quantity),
            operation
        );
        res.json(product);
    } catch (error) {
        logger.error('Error updating stock', { error: error.message, productId: req.params.id });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message, field: error.field });
    }
});

/*
  GET /api/products/:id/stock/check
  Stok kontrolü yapar
 */
router.get('/:id/stock/check', async (req, res) => {
    try {
        const { quantity } = req.query;
        const result = await productService.checkStock(
            req.params.id,
            parseInt(quantity || 1)
        );
        res.json(result);
    } catch (error) {
        logger.error('Error checking stock', { error: error.message, productId: req.params.id });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

/*
  GET /api/products/:id/prices
  Ürünün fiyatlarını getirir
 */
router.get('/:id/prices', async (req, res) => {
    try {
        const result = await productService.getProductPrices(req.params.id);
        res.json(result);
    } catch (error) {
        logger.error('Error fetching prices', { error: error.message, productId: req.params.id });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

/*
  POST /api/products/:id/prices
  Ürüne yeni fiyat ekler
  Body: { priceType: string, price: number, minQuantity: number }
 */
router.post('/:id/prices', async (req, res) => {
    try {
        const price = await productService.addProductPrice(req.params.id, req.body);
        res.status(201).json(price);
    } catch (error) {
        logger.error('Error adding price', { error: error.message, productId: req.params.id });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message, field: error.field });
    }
});

/*
  GET /api/products/:id/calculate-price
  Miktara göre fiyat hesaplar
 */
router.get('/:id/calculate-price', async (req, res) => {
    try {
        const { quantity } = req.query;
        const result = await productService.calculatePrice(
            req.params.id,
            parseInt(quantity || 1)
        );
        res.json(result);
    } catch (error) {
        logger.error('Error calculating price', { error: error.message, productId: req.params.id });
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = router;
