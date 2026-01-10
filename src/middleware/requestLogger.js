/*
Bu middleware, her gelen HTTP istegi için bir trace ID üretir ve
request ile response bilgilerini loglar. Böylece sistemde yapılan
istekler daha kolay takip edilebilir.

Amaç, hata oluştuğunda hangi istegin probleme neden olduğunu görmek
ve response sürelerini ölçerek temel performans takibi yapabilmektir.
Bu yapı özellikle production ortamında log analizi ve debugging için kullanılır.
*/


// Jest uyumluluğu için dinamik import
let uuidv4;
try {
    uuidv4 = require('uuid').v4;
} catch (e) {
// Fallback basit ID generator
    uuidv4 = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
}
const logger = require('../lib/logger');

// Request logging middleware

function requestLogger(req, res, next) {
// Unique trace ID oluştur
    const traceId = uuidv4();
    req.traceId = traceId;

// Request başlangıç zamanı
    const startTime = Date.now();

// Request bilgilerini logla
    logger.info('Incoming request', {
        traceId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

// Response finish event'ini dinle
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

        logger[logLevel]('Request completed', {
            traceId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        });
    });

    next();
}

module.exports = requestLogger;
