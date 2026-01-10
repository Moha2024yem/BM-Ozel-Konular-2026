/*
Burda Order API için entegrasyon testleri yer almaktadır.
Sipariş oluşturma listeleme, güncelleme ve durum değiştirme
senaryoları üzerinden API davranışı doğrulanmaktadır.

Bu testler sayesinde Order API, Test Süreci kapsamında
kararlı ve güvenilir şekilde test edilebilir hale gelmiştir.
*/



const request = require('supertest');
const app = require('../src/app');
const { Customer, Order } = require('../src/models');

// Order API için HTTP tabanlı entegrasyon testleri
describe('Orders API', () => {
    let testCustomer;
// Testlerde sipariş oluşturma senaryoları için gerekli olan müşteri kaydı
    beforeEach(async () => {
        // Her test için test müşterisi oluşturmak
        testCustomer = await Customer.create({
            firstName: 'Test',
            lastName: 'Customer',
            email: 'test@example.com',
            phone: '+905321112233',
            isActive: true
        });
    });

    describe('GET /api/orders', () => {
        test('should return empty list initially', async () => {
            const res = await request(app).get('/api/orders');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.orders).toEqual([]);
        });

        test('should return orders list with customer info', async () => {
            await Order.create({
                customerId: testCustomer.id,
                status: 'pending',
                totalAmount: 99.99
            });

            const res = await request(app).get('/api/orders');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.orders.length).toBe(1);
            expect(res.body.data.orders[0].Customer.firstName).toBe('Test');
        });

        test('should filter by status', async () => {
            await Order.create({
                customerId: testCustomer.id,
                status: 'pending',
                totalAmount: 50
            });
            await Order.create({
                customerId: testCustomer.id,
                status: 'delivered',
                totalAmount: 100
            });

            const res = await request(app).get('/api/orders?status=pending');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.orders.length).toBe(1);
            expect(res.body.data.orders[0].status).toBe('pending');
        });
    });

    describe('POST /api/orders', () => {
        test('should create order with valid data', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    customerId: testCustomer.id,
                    status: 'pending',
                    totalAmount: 150.50
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.customerId).toBe(testCustomer.id);
            expect(res.body.data.status).toBe('pending');
        });

        test('should fail without customerId', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    totalAmount: 100
                });

            expect(res.statusCode).toBe(400);
        });

        test('should fail with non-existent customer', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    customerId: 99999,
                    totalAmount: 100
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.error.message).toContain('not found');
        });

        test('should fail with invalid status', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    customerId: testCustomer.id,
                    status: 'invalid_status'
                });

            expect(res.statusCode).toBe(400);
        });

        test('should default to pending status', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    customerId: testCustomer.id,
                    totalAmount: 50
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.status).toBe('pending');
        });
    });

    describe('GET /api/orders/:id', () => {
        test('should return order with customer info', async () => {
            const order = await Order.create({
                customerId: testCustomer.id,
                status: 'pending',
                totalAmount: 75
            });

            const res = await request(app).get(`/api/orders/${order.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.id).toBe(order.id);
            expect(res.body.data.Customer).toBeDefined();
        });
    });

    describe('PUT /api/orders/:id', () => {
        test('should update order', async () => {
            const order = await Order.create({
                customerId: testCustomer.id,
                status: 'pending',
                totalAmount: 100
            });

            const res = await request(app)
                .put(`/api/orders/${order.id}`)
                .send({
                    status: 'shipped',
                    totalAmount: 120
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe('shipped');
            expect(parseFloat(res.body.data.totalAmount)).toBe(120);
        });
    });
// Sipariş durumunun kısmi güncellenmesini test eden senaryolar
    describe('PATCH /api/orders/:id/status', () => {
        test('should update only status', async () => {
            const order = await Order.create({
                customerId: testCustomer.id,
                status: 'pending',
                totalAmount: 100
            });

            const res = await request(app)
                .patch(`/api/orders/${order.id}/status`)
                .send({
                    status: 'delivered'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe('delivered');
        });
    });
});
