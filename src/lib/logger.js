// Logger sadece console'a yazıyordu ve production için uygun degildi.
// Problem: Loglar dosyaya kaydedilmediği için hata takibi ve debugging zorlaşiyordu
// Yapılan Değişiklik: Dosya logları eklendi, production için JSON format
// development için daha okunabilir bir format kullanıldı.
// Sonuc: Loglar artık hem console'da hem de dosyada tutulmaktadır.


const { createLogger, transports, format } = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Log klasörünü oluştur
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Production formatı: JSON
const productionFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

// Development formatı: Renkli ve okunabilir
const developmentFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ level, message, timestamp, traceId, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]`;

    if (traceId) {
      msg += ` [${traceId}]`;
    }

    msg += `: ${message}`;

    // Metadata varsa ekle
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    // Stack trace varsa ekle
    if (stack) {
      msg += `\n${stack}`;
    }

    return msg;
  })
);

const logger = createLogger({
  level: config.logging.level,
  format: config.app.isProduction ? productionFormat : developmentFormat,
  transports: [
    // Console transport
    new transports.Console({
      stderrLevels: ['error']
    }),

    // Combined log file
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Error log file
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});

// Test ortamında logları sessizleştir
if (config.app.isTest) {
  logger.transports.forEach(t => t.silent = true);
}

module.exports = logger;
