/*
Order API için gerekli endpointler bu dosyada toplandı.
Başlangıçta sadece listeleme yapılabiliyordu ve servis katmanı yoktu.

Bu güncelleme ile servis katmanı kullanıldı ve
sipariş oluşturma, güncelleme ve durum değiştirme
endpoint’leri eklendi.
*/

const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const logger = require('../lib/logger');

// GET /api/orders - Siparişleri listele (filtreleme destekli)
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, status, customerId } = req.query;
    const filters = {};

    if (page) filters.page = parseInt(page, 10);
    if (limit) filters.limit = parseInt(limit, 10);
    if (status) filters.status = status;
    if (customerId) filters.customerId = customerId;

    const result = await orderService.listOrders(filters);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    logger.error('Error listing orders', { err, traceId: req.traceId });
    next(err);
  }
});

// GET /api/orders/:id - Sipariş detay
router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    logger.error('Error getting order', { err, orderId: req.params.id, traceId: req.traceId });
    next(err);
  }
});

// POST /api/orders - Yeni sipariş oluştur
router.post('/', async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    logger.error('Error creating order', { err, traceId: req.traceId });
    next(err);
  }
});

// PUT /api/orders/:id - Sipariş güncelle
router.put('/:id', async (req, res, next) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);
    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    logger.error('Error updating order', { err, orderId: req.params.id, traceId: req.traceId });
    next(err);
  }
});

// PATCH /api/orders/:id/status - Sipariş durumu güncelle
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        error: { message: 'Status is required' }
      });
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    logger.error('Error updating order status', { err, orderId: req.params.id, traceId: req.traceId });
    next(err);
  }
});

module.exports = router;
