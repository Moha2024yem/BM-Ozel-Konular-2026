/*
Test: Basit Sipariş bu test basit sipariş oluşturmayı test ediyor
 */

const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Simple Order Test', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('ürünsüz basit guest sipariş oluşturmalı', async () => {
        const response = await request(app)
            .post('/api/orders')
            .send({
                customer: {
                    firstName: 'Test',
                    email: 'test@test.com'
                }
            });

        console.log('Durum:', response.status);
        console.log('Body:', JSON.stringify(response.body, null, 2));

        expect(response.status).toBe(201);
    });
});
