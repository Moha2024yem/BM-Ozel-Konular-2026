/**
Veritabanı isimlendirmesindeki tutarsızlık giderildi, ortam bazlı (dev/test/prod)
konfigürasyon yapısı oluşturuldu ve loglama entegrasyonu eklendi.
Böylece yanlış veritabanına bağlanma riski ve debug zorlukları ortadan kaldırıldı.
 */


require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

// Ortam bazlı veritabanı ismi
const getDatabaseName = () => {
  if (process.env.DB_NAME) {
    return process.env.DB_NAME;
  }
  // Ortam bazlı default isimler
  return `mini_crm_${env}`;
};

module.exports = {
  app: {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    env: env,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test'
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: getDatabaseName(),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    dialect: 'postgres',
    // Loglama: test ortamında kapalı, diğerlerinde logger ile entegre
    logging: env === 'test' ? false : (msg) => {
      const logger = require('../lib/logger');
      logger.debug(msg);
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
    filePath: process.env.LOG_FILE_PATH || null
  }
};
