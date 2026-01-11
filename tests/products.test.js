const request = require('supertest');
const app = require('../src/app');
const { sequelize, Product, ProductPrice } = require('../src/models');

describe('Product API Tests', () => {
    let createdProduct;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // Test ürünü oluşturmak için yardımcı fonksiyon
    async function createTestProduct(overrides = {}) {
        const response = await request(app)
            .post('/api/products')
            .send({
                name: 'Test Laptop',
                description: 'Gaming laptop',
                sku: `LAP-${Date.now()}-${Math.random()}`, // Unique SKU
                basePrice: 5000,
                stockQuantity: 10,
                trackInventory: true,
                ...overrides
            });
        return response.body;
    }

    describe('POST /api/products', () => {
        it('should create a new product with inventory tracking', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({
                    name: 'Laptop',
                    description: 'Gaming laptop',
                    sku: 'LAP-001',
                    basePrice: 5000,
                    stockQuantity: 10,
                    trackInventory: true
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Laptop');
            expect(response.body.trackInventory).toBe(true);
            expect(response.body.stockQuantity).toBe(10);
            createdProduct = response.body;
        });

        it('should create a product without inventory tracking', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({
                    name: 'Consulting Service',
                    description: 'IT Consulting',
                    basePrice: 500,
                    trackInventory: false
                });

            expect(response.status).toBe(201);
            expect(response.body.trackInventory).toBe(false);
            expect(response.body.stockQuantity).toBe(0);
        });

        it('should return 400 for missing product name', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({
                    basePrice: 100
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/name is required/i);
        });

        it('should return 400 for invalid base price', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({
                    name: 'Test Product',
                    basePrice: -10
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/must be greater than 0/i);
        });

        it('should return 400 for duplicate SKU', async () => {
            // Öncelikle belirli bir SKU'ya sahip bir ürün oluşturun.            
            await request(app)
                .post('/api/products')
                .send({
                    name: 'First Laptop',
                    sku: 'DUPLICATE-SKU',
                    basePrice: 3000
                });

            // Ardından aynı SKU ile bir tane daha oluşturmayı deneyin.            
            const response = await request(app)
                .post('/api/products')
                .send({
                    name: 'Another Laptop',
                    sku: 'DUPLICATE-SKU',
                    basePrice: 3000
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/SKU already exists/i);
        });
    });

    describe('GET /api/products', () => {
        it('should list all active products', async () => {
            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('products');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.products)).toBe(true);
        });

        it('should filter products by trackInventory', async () => {
            const response = await request(app).get('/api/products?trackInventory=false');

            expect(response.status).toBe(200);
            if (response.body.products.length > 0) {
                expect(response.body.products.every(p => p.trackInventory === false)).toBe(true);
            }
        });
    });

    describe('GET /api/products/:id', () => {
        it('should get a product by id', async () => {
            const product = await createTestProduct();
            const response = await request(app).get(`/api/products/${product.id}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(product.id);
        });

        it('should return 400 for non-existent product', async () => {
            const response = await request(app).get('/api/products/99999');

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/not found/i);
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update a product', async () => {
            const product = await createTestProduct();
            const response = await request(app)
                .put(`/api/products/${product.id}`)
                .send({
                    name: 'Gaming Laptop Pro',
                    basePrice: 6000
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Gaming Laptop Pro');
            expect(parseFloat(response.body.basePrice)).toBe(6000);
        });
    });

    describe('Stock Management', () => {
        it('should add stock to product', async () => {
            const product = await createTestProduct({ stockQuantity: 10 });
            const response = await request(app)
                .put(`/api/products/${product.id}/stock`)
                .send({
                    quantity: 5,
                    operation: 'add'
                });

            expect(response.status).toBe(200);
            expect(response.body.stockQuantity).toBe(15); // Was 10, added 5
        });

        it('should subtract stock from product', async () => {
            const product = await createTestProduct({ stockQuantity: 15 });
            const response = await request(app)
                .put(`/api/products/${product.id}/stock`)
                .send({
                    quantity: 3,
                    operation: 'subtract'
                });

            expect(response.status).toBe(200);
            expect(response.body.stockQuantity).toBe(12); // Was 15, subtracted 3
        });

        it('should return 400 for insufficient stock', async () => {
            const product = await createTestProduct({ stockQuantity: 5 });
            const response = await request(app)
                .put(`/api/products/${product.id}/stock`)
                .send({
                    quantity: 100,
                    operation: 'subtract'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/insufficient stock/i);
        });

        it('should check stock availability', async () => {
            const product = await createTestProduct({ stockQuantity: 10 });
            const response = await request(app)
                .get(`/api/products/${product.id}/stock/check?quantity=5`);

            expect(response.status).toBe(200);
            expect(response.body.available).toBe(true);
            expect(response.body.trackInventory).toBe(true);
        });
    });

    describe('Multiple Pricing', () => {
        let testProduct;

        beforeEach(async () => {
            // Her testten önce fiyatlandırma testleri için özel bir ürün oluşturun
            testProduct = await createTestProduct({ basePrice: 6000 });

            // Add wholesale price  
            await request(app)
                .post(`/api/products/${testProduct.id}/prices`)
                .send({
                    priceType: 'wholesale',
                    price: 4500,
                    minQuantity: 5
                });

            // Add bulk price
            await request(app)
                .post(`/api/products/${testProduct.id}/prices`)
                .send({
                    priceType: 'bulk',
                    price: 4000,
                    minQuantity: 10
                });
        });

        it('should add a new price to product', async () => {
            const response = await request(app)
                .post(`/api/products/${testProduct.id}/prices`)
                .send({
                    priceType: 'retail',
                    price: 5500,
                    minQuantity: 1
                });

            expect(response.status).toBe(201);
            expect(response.body.priceType).toBe('retail');
            expect(parseFloat(response.body.price)).toBe(5500);
        });

        it('should get all prices for product', async () => {
            const response = await request(app)
                .get(`/api/products/${testProduct.id}/prices`);

            expect(response.status).toBe(200);
            expect(response.body.prices.length).toBeGreaterThan(0);
        });

        it('should calculate price for quantity 1 (base price)', async () => {
            const response = await request(app)
                .get(`/api/products/${testProduct.id}/calculate-price?quantity=1`);

            expect(response.status).toBe(200);
            expect(parseFloat(response.body.unitPrice)).toBe(6000); // Base price
        });

        it('should calculate price for quantity 7 (wholesale)', async () => {
            const response = await request(app)
                .get(`/api/products/${testProduct.id}/calculate-price?quantity=7`);

            expect(response.status).toBe(200);
            expect(parseFloat(response.body.unitPrice)).toBe(4500); // Wholesale price
            expect(response.body.priceType).toBe('wholesale');
        });

        it('should calculate price for quantity 15 (bulk)', async () => {
            const response = await request(app)
                .get(`/api/products/${testProduct.id}/calculate-price?quantity=15`);

            expect(response.status).toBe(200);
            expect(parseFloat(response.body.unitPrice)).toBe(4000); // Bulk price
            expect(response.body.priceType).toBe('bulk');
            expect(parseFloat(response.body.total)).toBe(60000); // 15 * 4000
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should soft delete a product', async () => {
            // Silme testi için yeni bir ürün oluşturun
            const newProduct = await request(app)
                .post('/api/products')
                .send({
                    name: 'Product to Delete',
                    basePrice: 100
                });

            const response = await request(app)
                .delete(`/api/products/${newProduct.body.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
