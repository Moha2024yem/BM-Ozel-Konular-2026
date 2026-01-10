/*
Daha önce uygulamada basit bir loglama vardı ve hata yönetimi net degildi.
Requestler için trace ID üretilmiyor ve dönen error response yapısı tutarsızdı.

Bu nedenle request logger middleware projeye eklendi ve error handler
daha düzenli hale getirildi. Artık tüm istekler trace ID ile takip
edilebiliyor ve hatalar tek bir standart formatta dönüyor.
*/

const express = require('express');
const logger = require('./lib/logger');
const requestLogger = require('./middleware/requestLogger');

const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');

const app = express();

app.use(express.json());

// Request logging middleware
app.use(requestLogger);

app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      path: req.url
    }
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  const traceId = req.traceId || 'unknown';

  logger.error('Unhandled error', {
    traceId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Standardize error response
  const statusCode = err.statusCode || err.status || 500;
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal server error',
      traceId
    }
  };

  // Development ortamında stack trace eklemek
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

module.exports = app;
