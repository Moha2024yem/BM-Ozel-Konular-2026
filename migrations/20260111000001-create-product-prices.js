'use strict';

/*
 Migration: Product Prices Table bu tablo bir ürünün birden fazla fiyat türünü saklar.
 Örneğin: temel fiyat, toptan fiyat, perakende fiyat vb.
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_prices', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            price_type: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'base, wholesale, retail, bulk, etc.'
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            min_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                comment: 'Bu fiyat için minimum miktar'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        // Indexes
        await queryInterface.addIndex('product_prices', ['product_id']);
        await queryInterface.addIndex('product_prices', ['price_type']);
        await queryInterface.addIndex('product_prices', ['is_active']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('product_prices');
    }
};
