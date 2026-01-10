/*
Bu değişiklik kapsamında müşteri API’sine ait test altyapısı baştan ele alınmıştır
Önceki durumda testlerde sequelize.sync kullanılması, yetersiz setup yapısı ve eksik
CRUD senaryoları nedeniyle bazı testlerin kararsız (flaky) çalıştığı tespit edilmiştir
Bu sorunlar, testlerin güvenilirliğini ve sürdürülebilirliğini olumsuz etkilemekteydi.

Yapılan düzenlemelerle birlikte test setup yapısı iyileştirilmiş, tüm CRUD operasyonlarını kapsayan
entegrasyon testleri eklenmiş ve validation senaryoları detaylandırılmıştır
Böylece müşteri API’sinin tüm uç noktaları tutarlı ve tekrarlanabilir şekilde
test edilebilir hale getirilmiştir.

*/

const request = require('supertest');
const app = require('../src/app');
const { Customer } = require('../src/models');

describe('Customers API', () => {
  describe('GET /api/customers', () => {
    test('should return empty list initially', async () => {
      const res = await request(app).get('/api/customers');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customers).toEqual([]);
      expect(res.body.data.pagination.total).toBe(0);
    });

    test('should return customers list', async () => {
      // Test verisi oluşturmak
      await Customer.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+905321112233',
        isActive: true
      });

      const res = await request(app).get('/api/customers');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.customers.length).toBe(1);
      expect(res.body.data.customers[0].firstName).toBe('Test');
    });
  });

  describe('POST /api/customers', () => {
    test('should create customer with valid data', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          email: 'ahmet@example.com',
          phone: '05321112233'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Ahmet');
      expect(res.body.data.phone).toBe('+905321112233'); // Normalized
    });

    test('should fail without firstName', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          email: 'test@example.com'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Test',
          email: 'invalid-email'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('email');
    });

    test('should normalize phone number', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Test',
          phone: '0 532 111 22 33'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.phone).toBe('+905321112233');
    });
  });

  describe('GET /api/customers/:id', () => {
    test('should return customer by id', async () => {
      const customer = await Customer.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        isActive: true
      });

      const res = await request(app).get(`/api/customers/${customer.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.firstName).toBe('Test');
    });

    test('should return 400 for non-existent customer', async () => {
      const res = await request(app).get('/api/customers/99999');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/customers/:id', () => {
    test('should update customer', async () => {
      const customer = await Customer.create({
        firstName: 'Test',
        email: 'test@example.com',
        isActive: true
      });

      const res = await request(app)
        .put(`/api/customers/${customer.id}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.firstName).toBe('Updated');
      expect(res.body.data.lastName).toBe('Name');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    test('should soft delete customer', async () => {
      const customer = await Customer.create({
        firstName: 'Test',
        isActive: true
      });

      const res = await request(app).delete(`/api/customers/${customer.id}`);

      expect(res.statusCode).toBe(200);

// Verify soft delete
// Soft delete işleminin fiziksel silme yerine isActive alanı üzerinden yapıldığının doğrulanması
      const deletedCustomer = await Customer.findByPk(customer.id);
      expect(deletedCustomer.isActive).toBe(false);
    });
  });
});

//Sonuç olarak bu güncelleme ile Customer API için kapsamlı bir test coverage sağlanmış,
// flaky test problemleri giderilmiş ve Test Süreci başlığı altında belirtilen
//entegrasyon testi gereksinimleri karşılanmıştır.