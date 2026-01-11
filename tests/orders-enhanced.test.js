/*
Bu test dosyası yeni özellikleri test ediyor
1 Guest müşteri ile sipariş yapmak
2 Stok kontrolü ve otomatik güncellemek
3 Backordered sipariş durumu
 */

const request = require('supertest');
const app = require('../src/app');
const { sequelize, Customer, Product } = require('../src/models');

describe('Enhanced Orders: Guest Customer & Stock Management', () => {
    let testProduct;

    beforeEach(async () => {
        await sequelize.sync({ force: true });

        // Her test için yeni ürün oluşturmak
        testProduct = await Product.create({
            name: 'Test Laptop',
            basePrice: 1000,
            stockQuantity: 50,
            trackInventory: true,
            isActive: true
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('✅ Guest Müşteri Siparişleri', () => {
        it('guest müşteri ve ürünlerle sipariş oluşturmalı', async () => {
            const response = await request(app)
                .post('/api/orders')
                .send({
                    customer: {
                        firstName: 'Ali',
                        lastName: 'Yılmaz',
                        email: 'ali@test.com',
                        phone: '5551234567'
                    },
                    items: [
                        {
                            productId: testProduct.id,
                            quantity: 2
                        }
                    ]
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.Customer.firstName).toBe('Ali');
        });

        it('ürünsüz basit sipariş oluşturmalı', async () => {
            const response = await request(app)
                .post('/api/orders')
                .send({
                    customer: {
                        firstName: 'Ayşe',
                        email: 'ayse@test.com'
                    }
                });

            expect(response.status).toBe(201);
            expect(response.body.data.Customer.firstName).toBe('Ayşe');
        });
    });

    describe('✅ Stok Yönetimi', () => {
        it('sipariş oluşturulunca stok azalmalı', async () => {
            const initialStock = testProduct.stockQuantity;

            const response = await request(app)
                .post('/api/orders')
                .send({
                    customer: {
                        firstName: 'Mehmet',
                        phone: '5559876543'
                    },
                    items: [
                        {
                            productId: testProduct.id,
                            quantity: 3
                        }
                    ]
                });

            expect(response.status).toBe(201);

            // Stok azaldı mı kontrol etmek
            const updated = await Product.findByPk(testProduct.id);
            expect(updated.stockQuantity).toBe(initialStock - 3);
        });

        it('stok yetersiz olunca backordered yapmalı', async () => {
            const response = await request(app)
                .post('/api/orders')
                .send({
                    customer: {
                        firstName: 'Fatma',
                        phone: '5551112233'
                    },
                    items: [
                        {
                            productId: testProduct.id,
                            quantity: 100  // Mevcut stoktan fazla (50)
                        }
                    ]
                });

            expect(response.status).toBe(201);
            expect(response.body.data.status).toBe('backordered');
        });
    });

    describe('✅ Mevcut Müşteri Siparişleri', () => {
        it('mevcut müşteri ID ile sipariş oluşturmalı', async () => {
            // Önce müşteri oluşturmak
            const customer = await Customer.create({
                firstName: 'Existing',
                lastName: 'Customer',
                email: 'existing@test.com',
                phone: '+905551234567',
                isActive: true
            });

            const response = await request(app)
                .post('/api/orders')
                .send({
                    customerId: customer.id,
                    items: [
                        {
                            productId: testProduct.id,
                            quantity: 1
                        }
                    ]
                });

            expect(response.status).toBe(201);
            expect(response.body.data.customerId).toBe(customer.id);
        });
    });
});
