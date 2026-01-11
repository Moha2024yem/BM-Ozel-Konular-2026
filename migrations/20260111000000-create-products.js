'use strict';

/*
Migration: Products Table
Bu tablo ürünleri saklar bazı ürünler için stok takibi yapılır (track_inventory = true),
bazıları için yapılmaz (hizmetler gibi).
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Temel birim fiyatı'
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      track_inventory: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Bazı ürünlerin stok takibi yapılmıyor'
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

    // Index for faster queries
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['sku']);
    await queryInterface.addIndex('products', ['is_active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};
