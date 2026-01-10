/*
Bu dosyada testler için merkezi bir setup yapısı tanımlanmıştır.
Test ortamında veritabanı bağlantısının kurulması, logların susturulması
ve test veritabanının hazırlanması bu yapı üzerinden yönetilmektedir.

Merkezi bir setup kullanılması sayesinde testler izole,
tutarlı ve tekrarlanabilir şekilde çalıştırılabilmektedir.
*/

const { sequelize } = require('../src/models');
const logger = require('../src/lib/logger');

// Test ortamında logları sustur
logger.transports.forEach(t => t.silent = true);

// Her test suite öncesi çalışır
beforeAll(async () => {
    // Veritabanı bağlantısını test et
    await sequelize.authenticate();
    console.log('Test veritabanı bağlantısı başarılı');

    // Migration'ları çalıştır (test veritabanında)
    // Not: Normalde sequelize-cli kullanılır ama burada basit yaklaşım kullanıyoruz
    await sequelize.sync({ force: true });
});

// Her test suite sonrası çalışır
afterAll(async () => {
    // Bağlantıyı kapat
    await sequelize.close();
});

// Her test sonrası cleanup
afterEach(async () => {
    // Testler arası izolasyon için tabloları temizle
    const models = Object.values(sequelize.models);
    for (const model of models) {
        await model.destroy({ where: {}, truncate: true, cascade: true });
    }
});
