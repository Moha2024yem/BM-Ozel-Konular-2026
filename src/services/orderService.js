/*
Bu dosya projede eksik olan order servis katmanını eklemek için oluşturuldu.
Önceden sipariş işlemleri route içinde doğrudan model kullanılarak yapılıyordu.

Bu yapı ile birlikte sipariş listeleme, oluşturma ve güncelleme işlemleri
servis katmanına taşındı. Böylece business logic route dosyalarından
ayrılmış oldu ve daha temiz bir mimari elde edildi.
*/

const { Order, Customer } = require('../models');
const logger = require('../lib/logger');
const { createValidationError } = require('../utils/validators');

/**
 * Siparişleri listeler (filtreleme destekli)
 */
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

/**
 * ID'ye göre sipariş getirir
 */
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

/**
 * Yeni sipariş oluşturur
 */
async function createOrder(payload) {
    // Validation
    if (!payload.customerId) {
        throw createValidationError('Customer ID is required', 'customerId');
    }

    // Müşteri varlık kontrolü
    const customer = await Customer.findByPk(payload.customerId, {
        where: { isActive: true }
    });

    if (!customer) {
        throw createValidationError('Customer not found or inactive', 'customerId');
    }

    // Sipariş durumu validation
    const validStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'];
    const status = payload.status || 'pending';

    if (!validStatuses.includes(status)) {
        throw createValidationError(
            `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
            'status'
        );
    }

    // Total amount validation
    if (payload.totalAmount !== undefined && payload.totalAmount < 0) {
        throw createValidationError('Total amount cannot be negative', 'totalAmount');
    }

    const orderData = {
        customerId: payload.customerId,
        status,
        totalAmount: payload.totalAmount || null
    };

    logger.info('Creating order', {
        customerId: payload.customerId,
        status,
        totalAmount: payload.totalAmount
    });

    const order = await Order.create(orderData);

    // Müşteri bilgisi ile birlikte geri dön
    return await getOrderById(order.id);
}

/**
 * Sipariş durumunu günceller
 */
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

/**
 * Siparişi günceller
 */
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
