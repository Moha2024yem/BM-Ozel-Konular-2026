/*
Bu servis ürün yönetimi için gerekli tüm işlemleri içerir.
Özellikle bazı ürünlerin stok takibi yapılmadığı ve 
birden fazla fiyat türünün olabildiği durumları ele alır.
*/

const { Product, ProductPrice, OrderItem } = require('../models');
const logger = require('../lib/logger');
const { createValidationError } = require('../utils/validators');
const { Op } = require('sequelize');


//Ürünleri listeler (filtreleme destekli)

async function listProducts(filters = {}) {
    const { page = 1, limit = 50, isActive = true, trackInventory } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (isActive !== undefined) {
        where.isActive = isActive;
    }
    if (trackInventory !== undefined) {
        where.trackInventory = trackInventory;
    }

    const { rows, count } = await Product.findAndCountAll({
        where,
        include: [{
            model: ProductPrice,
            as: 'prices',
            where: { isActive: true },
            required: false
        }],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    });

    return {
        products: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    };
}


//ID'ye göre ürün getirmek

async function getProductById(id) {
    const product = await Product.findByPk(id, {
        include: [{
            model: ProductPrice,
            as: 'prices',
            where: { isActive: true },
            required: false
        }]
    });

    if (!product) {
        throw createValidationError('Product not found', 'id');
    }

    return product;
}


//Yeni ürün oluşturmak

async function createProduct(payload) {
    // Validation
    if (!payload.name || !payload.name.trim()) {
        throw createValidationError('Product name is required', 'name');
    }

    if (!payload.basePrice || payload.basePrice <= 0) {
        throw createValidationError('Base price must be greater than 0', 'basePrice');
    }

    // SKU uniqueness check
    if (payload.sku) {
        const existing = await Product.findOne({
            where: { sku: payload.sku, isActive: true }
        });
        if (existing) {
            throw createValidationError('SKU already exists', 'sku');
        }
    }

    const productData = {
        name: payload.name.trim(),
        description: payload.description || null,
        sku: payload.sku || null,
        basePrice: payload.basePrice,
        stockQuantity: payload.stockQuantity || 0,
        trackInventory: payload.trackInventory !== undefined ? payload.trackInventory : true,
        isActive: true
    };

    logger.info('Creating product', { name: productData.name, sku: productData.sku });
    const product = await Product.create(productData);

    return product;
}


//Ürünü güncellemek

async function updateProduct(id, payload) {
    const product = await getProductById(id);

    const updateData = {};

    if (payload.name !== undefined) {
        if (!payload.name || !payload.name.trim()) {
            throw createValidationError('Product name is required', 'name');
        }
        updateData.name = payload.name.trim();
    }

    if (payload.description !== undefined) {
        updateData.description = payload.description || null;
    }

    if (payload.sku !== undefined) {
        if (payload.sku) {
            const existing = await Product.findOne({
                where: {
                    sku: payload.sku,
                    id: { [Op.ne]: id },
                    isActive: true
                }
            });
            if (existing) {
                throw createValidationError('SKU already exists', 'sku');
            }
        }
        updateData.sku = payload.sku || null;
    }

    if (payload.basePrice !== undefined) {
        if (payload.basePrice <= 0) {
            throw createValidationError('Base price must be greater than 0', 'basePrice');
        }
        updateData.basePrice = payload.basePrice;
    }

    if (payload.trackInventory !== undefined) {
        updateData.trackInventory = payload.trackInventory;
    }

    await product.update(updateData);
    logger.info('Product updated', { productId: id });

    return await getProductById(id);
}


//Ürünü silmek (soft delete)

async function deleteProduct(id) {
    const product = await getProductById(id);

    await product.update({ isActive: false });
    logger.info('Product soft deleted', { productId: id });

    return { success: true, message: 'Product deleted successfully' };
}


//Stok miktarını günceller
//@param {number} productId - Ürün ID
//@param {number} quantity - Miktar
//@param {string} operation - 'add' veya 'subtract'

async function updateStock(productId, quantity, operation = 'add') {
    const product = await getProductById(productId);

    // Stok takibi yapılmayan ürünler için uyarı
    if (!product.trackInventory) {
        logger.warn('Attempting to update stock for non-tracked product', { productId });
        throw createValidationError('This product does not track inventory', 'trackInventory');
    }

    if (quantity <= 0) {
        throw createValidationError('Quantity must be greater than 0', 'quantity');
    }

    let newStock = product.stockQuantity;
    if (operation === 'add') {
        newStock += quantity;
    } else if (operation === 'subtract') {
        newStock -= quantity;
        if (newStock < 0) {
            throw createValidationError('Insufficient stock', 'stockQuantity');
        }
    } else {
        throw createValidationError('Invalid operation. Use "add" or "subtract"', 'operation');
    }

    await product.update({ stockQuantity: newStock });
    logger.info('Stock updated', { productId, operation, quantity, newStock });

    return await getProductById(productId);
}


//Stok kontrolü yapar

async function checkStock(productId, quantity) {
    const product = await getProductById(productId);

    // Stok takibi yapılmayan ürünler her zaman "müsait"
    if (!product.trackInventory) {
        return {
            available: true,
            stockQuantity: null,
            trackInventory: false
        };
    }

    const available = product.stockQuantity >= quantity;

    return {
        available,
        stockQuantity: product.stockQuantity,
        trackInventory: true,
        requested: quantity
    };
}


//Ürüne fiyat eklemek

async function addProductPrice(productId, priceData) {
    const product = await getProductById(productId);

    // Validation
    if (!priceData.priceType || !priceData.priceType.trim()) {
        throw createValidationError('Price type is required', 'priceType');
    }

    if (!priceData.price || priceData.price <= 0) {
        throw createValidationError('Price must be greater than 0', 'price');
    }

    const minQuantity = priceData.minQuantity || 1;
    if (minQuantity < 1) {
        throw createValidationError('Min quantity must be at least 1', 'minQuantity');
    }

    const newPrice = await ProductPrice.create({
        productId,
        priceType: priceData.priceType.trim().toLowerCase(),
        price: priceData.price,
        minQuantity,
        isActive: true
    });

    logger.info('Product price added', { productId, priceType: newPrice.priceType });

    return newPrice;
}


//Ürünün fiyatlarını getirmek

async function getProductPrices(productId) {
    const product = await getProductById(productId);

    const prices = await ProductPrice.findAll({
        where: { productId, isActive: true },
        order: [['minQuantity', 'ASC']]
    });

    return {
        product: {
            id: product.id,
            name: product.name,
            basePrice: product.basePrice
        },
        prices
    };
}


//Miktara göre uygun fiyatı hesaplamak

async function calculatePrice(productId, quantity) {
    const product = await getProductById(productId);

    const prices = await ProductPrice.findAll({
        where: {
            productId,
            isActive: true,
            minQuantity: { [Op.lte]: quantity }
        },
        order: [['minQuantity', 'DESC']]
    });

    // En yüksek min_quantity'ye sahip fiyatı seçmek (bulktan başlar)
    let selectedPrice = product.basePrice;
    let priceType = 'base';

    if (prices.length > 0) {
        selectedPrice = prices[0].price;
        priceType = prices[0].priceType;
    }

    return {
        productId,
        quantity,
        unitPrice: selectedPrice,
        priceType,
        total: selectedPrice * quantity
    };
}

module.exports = {
    listProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    checkStock,
    addProductPrice,
    getProductPrices,
    calculatePrice
};
