/*
Bu dosyada customer endpoint’leri tamamlandı
Önceden sadece listeleme ve müşteri oluşturma işlemleri vardı.
Detay görüntüleme, güncelleme ve silme işlemleri eksikti
Bu nedenle REST yapısına uygun olacak şekilde
GET /:id, PUT /:id ve DELETE /:id endpoint’leri eklendi.

Böylece customer tarafındaki tüm temel CRUD işlemleri
tek bir servis katmani üzerinden yönetilebilir hale geldi.
*/

const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const logger = require('../lib/logger');

// GET /api/customers - Tüm müşterileri listele
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, isActive } = req.query;
    const options = {};

    if (page) options.page = parseInt(page, 10);
    if (limit) options.limit = parseInt(limit, 10);
    if (isActive !== undefined) options.isActive = isActive === 'true';

    const result = await customerService.listCustomers(options);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    logger.error('Error listing customers', { err, traceId: req.traceId });
    next(err);
  }
});

// GET /api/customers/:id - Müşteri detay
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    res.json({
      success: true,
      data: customer
    });
  } catch (err) {
    logger.error('Error getting customer', { err, customerId: req.params.id, traceId: req.traceId });
    next(err);
  }
});

// POST /api/customers - Yeni müşteri oluştur
router.post('/', async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (err) {
    logger.error('Error creating customer', { err, traceId: req.traceId });
    next(err);
  }
});

// PUT /api/customers/:id - Müşteri güncelle
router.put('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.json({
      success: true,
      data: customer
    });
  } catch (err) {
    logger.error('Error updating customer', { err, customerId: req.params.id, traceId: req.traceId });
    next(err);
  }
});

// DELETE /api/customers/:id - Müşteri silme (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    logger.error('Error deleting customer', { err, customerId: req.params.id, traceId: req.traceId });
    next(err);
  }
});

module.exports = router;
