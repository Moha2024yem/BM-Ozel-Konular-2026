'use strict';

/*
Problem: Customer model dosyasında isActive alanı bulunmasına ragmen 
veritabanı migration dosyasında tanımlı değildi Bu durum migration
 tabanlı yapıda model ile veritabanı şeması arasında uyumsuzluğa neden oluyordu.

Çözüm: Customer tablosuna is_active alanını ekleyen yeni bir migration oluşturulmuş,
böylece model ile veritabanı şeması uyumlu hale getirilmiş ve
isActive alanı üzerinden soft delete işlemleri sorunsuz 
şekilde çalışabilir duruma getirilmiştir

*/

module.exports = {
    async up(queryInterface, Sequelize) {
        // İdempotent migration: Kolon zaten varsa hata vermez
        const tableDescription = await queryInterface.describeTable('customers');

        if (!tableDescription.is_active) {
            await queryInterface.addColumn('customers', 'is_active', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            });

            // Mevcut tüm kayıtlar için is_active değerini true yapmak
            await queryInterface.sequelize.query(
                'UPDATE customers SET is_active = true WHERE is_active IS NULL'
            );
        }
    },

    async down(queryInterface) {
        const tableDescription = await queryInterface.describeTable('customers');

        if (tableDescription.is_active) {
            await queryInterface.removeColumn('customers', 'is_active');
        }
    }
};
