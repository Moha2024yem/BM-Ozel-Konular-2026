/*
 Test . Debug - Ürünlü Sipariş bu test sipariş oluştururken hata mesajını gösteriyor
 */

const request = require('supertest');
const app = require('../src/app');
const { sequelize, Product } = require('../src/models');

describe('Debug Order with Items', () => {
    let testProduct;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        testProduct = await Product.create({
            name: 'Test Laptop',
            basePrice: 1000,
            stockQuantity: 10,
            trackInventory: true,
            isActive: true
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('ürünlü sipariş oluştururken hatayı göstermeli', async () => {
        const response = await request(app)
            .post('/api/orders')
            .send({
                customer: {
                    firstName: 'Test',
                    email: 'test@test.com'
                },
                items: [
                    {
                        productId: testProduct.id,
                        quantity: 2
                    }
                ]
            });

        console.log('\n=== CEVAP ===');
        console.log('Durum:', response.status);
        console.log('Body:', JSON.stringify(response.body, null, 2));
        console.log('================\n');
    });
});
