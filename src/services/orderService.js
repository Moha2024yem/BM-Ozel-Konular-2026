/**
Bu dosya sipariş servisi içindir. Önceden sipariş işlemleri route içinde
yapılıyordu, ancak artık sipariş listeleme, oluşturma ve güncelleme
işlemleri servis katmanında yapılmaktadır bu sayede kod daha temiz
ve yönetilebilir hale gelmiştir.
 
Ayrıca guest müşteri ile sipariş oluşturma, stok kontrolü ve stokların
otomatik güncellenmesi gibi yeni özellikler de eklenmiştir.
 */


const { Order, Customer, OrderItem, Product } = require('../models');
const logger = require('../lib/logger');
const { createValidationError } = require('../utils/validators');
const productService = require('./productService');

// Siparişleri listelemek (filtre ile)
async function listOrders(filters = {}) {
    const { page = 1, limit = 20, status, customerId } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
        where.status = status;
    }
    if (customerId) {
        where.customerId = parseInt(customerId, 10);
    }

    const { rows, count } = await Order.findAndCountAll({
        where,
        include: [{
            model: Customer,
            as: 'Customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    });

    return {
        orders: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    };
}

// ID ile sipariş getirmek
async function getOrderById(id) {
    const order = await Order.findByPk(id, {
        include: [{
            model: Customer,
            as: 'Customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address']
        }]
    });

    if (!order) {
        throw createValidationError('Order not found', 'id');
    }

    return order;
}

/*
Yeni sipariş oluşturmak
Eğer müşteri yoksa, otomatik guest müşteri yap
Eğer ürün varsa, stok kontrol et ve stoktan düş
 */
async function createOrder(payload) {
    let customerId = payload.customerId;

    // customerId yoksa ama müşteri bilgisi varsa, guest müşteri yapmak
    if (!customerId && payload.customer) {
        logger.info('Creating guest customer for order', {
            name: payload.customer.firstName
        });

        const guestCustomer = await Customer.create({
            firstName: payload.customer.firstName,
            lastName: payload.customer.lastName || null,
            email: payload.customer.email || null,
            phone: payload.customer.phone || null,
            address: payload.customer.address || null,
            isActive: true
        });

        customerId = guestCustomer.id;
        logger.info('Guest customer created', { customerId });
    }

    // Müşteri ID kontrol etmek
    if (!customerId) {
        throw createValidationError(
            'Customer ID or customer information is required',
            'customerId'
        );
    }

    // Müşteri var mı kontrol etmek
    const customer = await Customer.findByPk(customerId);

    if (!customer) {
        throw createValidationError('Customer not found', 'customerId');
    }

    // Sipariş durumu kontrol etmek
    const validStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled', 'backordered'];
    const status = payload.status || 'pending';

    if (!validStatuses.includes(status)) {
        throw createValidationError(
            `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
            'status'
        );
    }

    // Eğer ürünler varsa, stok kontrol etmek
    let totalAmount = payload.totalAmount || 0;
    const orderItems = [];

    if (payload.items && payload.items.length > 0) {
        for (const item of payload.items) {
            const product = await productService.getProductById(item.productId);

            // Stok kontrol et - sadece takip edilen ürünler için
            if (product.trackInventory) {
                const stockCheck = await productService.checkStock(
                    item.productId,
                    item.quantity
                );

                if (!stockCheck.available) {
                    logger.warn('Product out of stock', {
                        productId: item.productId,
                        requested: item.quantity,
                        available: stockCheck.stockQuantity
                    });

                    // Stok yoksa sipariş durumunu backordered yapmak
                    if (status === 'pending') {
                        logger.info('Setting order status to backordered due to stock');
                        payload.status = 'backordered';
                    }
                }
            }

            // Fiyat hesaplamak
            const priceInfo = await productService.calculatePrice(
                item.productId,
                item.quantity
            );

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: priceInfo.unitPrice,
                subtotal: priceInfo.total
            });

            totalAmount += parseFloat(priceInfo.total);
        }
    }

    // Toplam tutar kontrol etmek
    if (totalAmount < 0) {
        throw createValidationError('Total amount cannot be negative', 'totalAmount');
    }

    const orderData = {
        customerId,
        status: payload.status || status,
        totalAmount
    };

    logger.info('Creating order', {
        customerId,
        status: orderData.status,
        totalAmount,
        itemsCount: orderItems.length
    });

    const order = await Order.create(orderData);

    // Sipariş ürünlerini kaydetmek
    if (orderItems.length > 0) {
        for (const item of orderItems) {
            await OrderItem.create({
                orderId: order.id,
                ...item
            });

            // Stoktan düş (sadece takip edilen ürünler için)
            const product = await productService.getProductById(item.productId);
            if (product.trackInventory && orderData.status !== 'backordered') {
                // Sadece stok varsa düş
                try {
                    await productService.updateStock(
                        item.productId,
                        item.quantity,
                        'subtract'
                    );
                    logger.info('Stock updated after order', {
                        productId: item.productId,
                        quantity: item.quantity
                    });
                } catch (error) {
                    logger.warn('Could not update stock for backordered item', {
                        productId: item.productId,
                        error: error.message
                    });
                }
            } else if (orderData.status === 'backordered') {
                logger.info('Skipping stock update for backordered item', {
                    productId: item.productId,
                    quantity: item.quantity
                });
            }
        }
    }

    // Müşteri bilgisi ile geri dönmek
    return await getOrderById(order.id);
}

// Sipariş durumunu güncelleme
async function updateOrderStatus(id, status) {
    const order = await getOrderById(id);

    const validStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        throw createValidationError(
            `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
            'status'
        );
    }

    await order.update({ status });
    logger.info('Order status updated', { orderId: id, newStatus: status });

    return await getOrderById(id);
}

// Siparişi güncelleme
async function updateOrder(id, payload) {
    const order = await getOrderById(id);

    const updateData = {};

    // Status
    if (payload.status !== undefined) {
        const validStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(payload.status)) {
            throw createValidationError(
                `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
                'status'
            );
        }
        updateData.status = payload.status;
    }

    // Total amount
    if (payload.totalAmount !== undefined) {
        if (payload.totalAmount < 0) {
            throw createValidationError('Total amount cannot be negative', 'totalAmount');
        }
        updateData.totalAmount = payload.totalAmount;
    }

    await order.update(updateData);
    logger.info('Order updated', { orderId: id });

    return await getOrderById(id);
}

module.exports = {
    listOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateOrder
};
