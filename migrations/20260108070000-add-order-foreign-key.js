'use strict';

/**

Problem: Orders tablosunda customer_id alanı bulunmasına
ragmen foreign key constraint tanımlı degildi
Bu nedenle veritabanı seviyesinde referans bütünlügü 
saglanamıyor olmayan müşterilere ait siparişler oluşturulabiliyor
veya müşteri silindiginde orphan kayıtlar kalabiliyordu.

Çözüm ve Sonuç: orders.customer_id alani için foreign key constraint eklenmiş
böylece veri tutarlılıgı saglanmış; artık olmayan bir müşteriye sipariş atanamaz
ve muşteri silindiginde ilişkili siparisler otomatik olarak silinir(CASCADE).
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        // İdempotent migration: Constraint zaten varsa hata vermez
        try {
            // Foreign key ekle
            await queryInterface.addConstraint('orders', {
                fields: ['customer_id'],
                type: 'foreign key',
                name: 'fk_orders_customer',
                references: {
                    table: 'customers',
                    field: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
        } catch (error) {
            // Constraint zaten varsa devam et
            if (!error.message.includes('already exists')) {
                throw error;
            }
        }
    },

    async down(queryInterface) {
        try {
            await queryInterface.removeConstraint('orders', 'fk_orders_customer');
        } catch (error) {
            // Constraint yoksa devam et
            if (!error.message.includes('does not exist')) {
                throw error;
            }
        }
    }
};
