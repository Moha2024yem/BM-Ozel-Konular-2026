# Mini-CRM - Müşteri ve Sipariş Yönetim Sistemi

Küçük e-ticaret firmalar\u0131 için geliştirilmiş müşteri ve sipariş takip sistemi.

## Özellikler

- 1 Müşteri yönetimi (CRUD operasyonları)
- 2 Sipariş yönetimi ve durum takibi
- 3 Pagination desteği
- 4 Veri validasyonu ve normalizasyonu
- 5 Telefon numarası otomatik formatlaması (+90 formatına)
- 6 Email validasyonu
- 7 Duplicate kontrolü
- 8 Request/response loglama
- 9 Trace ID ile hata takibi
- 10 CSV'den toplu müşteri import (ETL)
- 11 Kapsamlı test coverage

## Sistem Gereksinimleri

- **Node.js**: v14.0.0 veya üzeri
- **PostgreSQL**: v12.0 veya üzeri
- **npm**: v6.0.0 veya üzeri

## Kurulum

### 1. Proje Dosyalarını İndirin

```bash
git clone <repo-url>
cd BM-Ozel-Konular-2026-1
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Veritabanı Kurulumu

PostgreSQL'de veritabanı oluşturun:

```sql
CREATE DATABASE mini_crm_dev;
CREATE DATABASE mini_crm_test; -- Test için
```

### 4. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
copy .env.example .env
```

`.env` dosyasını düzenleyin:

```env
NODE_ENV=development

# Veritabanı
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_crm_dev
DB_USER=postgres
DB_PASS=sizin_şifreniz

# Uygulama
APP_PORT=3000

# Loglama
LOG_LEVEL=debug
```

### 5. Migration Çalıştırın

```bash
npm run migrate
```

Migration başarılı olursa şu mesajı göreceksiniz:
```
== 20240101000000-create-customer: migrating
== 20240101000000-create-customer: migrated
== 20240102000000-create-order: migrating
== 20240102000000-create-order: migrated
== 20240103000000-add-customer-isactive: migrating
== 20240103000000-add-customer-isactive: migrated
== 20240104000000-add-order-foreign-key: migrating
== 20240104000000-add-order-foreign-key: migrated
```

### 6. Sunucuyu Başlatın

Development modda:
```bash
npm run dev
```

Production modda:
```bash
npm start
```

Sunucu başarıyla başladığında:
```
Server listening on port 3000
DB connection OK
```

## API Kullanımı

### Müşteri API

#### Tüm Müşterileri Listele
```bash
GET /api/customers?page=1&limit=50&isActive=true
```

#### Müşteri Detay
```bash
GET /api/customers/:id
```

#### Yeni Müşteri Oluştur
```bash
POST /api/customers
Content-Type: application/json

{
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet@example.com",
  "phone": "0532 111 22 33",
  "address": "İstanbul, Türkiye"
}
```

#### Müşteri Güncelle
```bash
PUT /api/customers/:id
Content-Type: application/json

{
  "lastName": "Demir",
  "phone": "+90 555 444 33 22"
}
```

#### Müşteri Sil (Soft Delete)
```bash
DELETE /api/customers/:id
```

### Sipariş API

#### Tüm Siparişleri Listele
```bash
GET /api/orders?status=pending&customerId=1
```

#### Sipariş Detay
```bash
GET /api/orders/:id
```

#### Yeni Sipariş Oluştur
```bash
POST /api/orders
Content-Type: application/json

{
  "customerId": 1,
  "status": "pending",
  "totalAmount": 150.50
}
```

**Geçerli Sipariş Durumları:**
- `pending` - Beklemede
- `preparing` - Hazırlanıyor
- `shipped` - Kargoda
- `delivered` - Teslim edildi
- `cancelled` - İptal edildi

#### Sipariş Güncelle
```bash
PUT /api/orders/:id
Content-Type: application/json

{
  "status": "shipped",
  "totalAmount": 175.00
}
```

#### Sadece Durum Güncelle
```bash
PATCH /api/orders/:id/status
Content-Type: application/json

{
  "status": "delivered"
}
```

## CSV'den Müşteri İmport (ETL)

Toplu müşteri verilerini CSV dosyasından içe aktarabilirsiniz:

```bash
npm run import:customers customers_raw_ordered.csv
```

**CSV Formatı:**
```csv
Ad,Soyad,Telefon,Email,Adres
Ahmet,Yilmaz,+90 532 111 22 33,ahmet@example.com,"Istanbul, Kadikoy"
```

Script otomatik olarak:
- Telefon numaralarını normalize eder (+90XXXXXXXXXX formatına)
- Email adreslerini validate eder
- Duplicate kayıtları tespit eder
- Hatalı kayıtları raporlar (`etl-errors.log` dosyasına)

## Test Çalıştırma

### Tüm Testleri Çalıştır
```bash
npm test
```

### Watch Modda Test
```bash
npm run test:watch
```

### Test Coverage Raporu
```bash
npm run test:coverage
```

Coverage raporu `coverage/` klasöründe oluşturulur.

## Loglama

Loglar hem console'da hem de dosyalarda saklanır:

- `logs/combined.log` - Tüm loglar (info seviyesi ve üzeri)
- `logs/error.log` - Sadece hatalar

**Log Seviyeleri:**
- `error` - Kritik hatalar
- `warn` - Uyarılar
- `info` - Bilgilendirme
- `debug` - Detaylı debug bilgisi (development)

Her request için unique **trace ID** oluşturulur ve hata takibi kolaylaşır.

## Proje Yapısı

```
BM-Ozel-Konular-2026-1/
├── migrations/          # Veritabanı migration dosyalar\u0131
├── scripts/             # ETL ve utility scriptler
│   └── import-customers.js
├── src/
│   ├── config/          # Konfigürasyon dosyalar\u0131
│   ├── lib/             # Logger vb. yardımcı kütüphaneler
│   ├── middleware/      # Express middleware'ler
│   ├── models/          # Sequelize modeller
│   ├── routes/          # API route'lar\u0131
│   ├── services/        # Business logic katman\u0131
│   ├── utils/           # Utility fonksiyonlar
│   ├── app.js           # Express app konfigürasyonu
│   └── server.js        # HTTP sunucu
├── tests/               # Test dosyalar\u0131
│   ├── setup.js
│   ├── customers.test.js
│   └── orders.test.js
├── .env.example         # Ortam değişkenleri şablonu
├── .sequelizerc         # Sequelize CLI konfigürasyonu
└── package.json
```

## Geliştirme

### Yeni Migration Oluşturma

```bash
npx sequelize migration:generate --name migration-ismi
```

Migration dosyasını düzenledikten sonra:

```bash
npm run migrate
```

### Rollback

```bash
npx sequelize db:migrate:undo
```

## Sorun Giderme

### Migration Hatası

Eğer "column already exists" hatası alıyorsanız:

```bash
# Veritabanını sıfırlayın
DROP DATABASE mini_crm_dev;
CREATE DATABASE mini_crm_dev;

# Migration'ları tekrar çalıştırın
npm run migrate
```

### Test Hatası

Test veritabanının temiz olduğundan emin olun:

```sql
DROP DATABASE mini_crm_test;
CREATE DATABASE mini_crm_test;
```

### Bağlantı Hatası

PostgreSQL servisinin çalıştığından emin olun:

```bash
# Windows
services.msc

# PostgreSQL servisini başlatın
```

## Yüklü Paketler

### Production Bağımlılıkları
- **express** (4.22.1) - Web framework
- **sequelize** (6.37.7) - ORM için PostgreSQL
- **pg** (8.16.3) - PostgreSQL client
- **pg-hstore** (2.3.4) - Sequelize için gerekli
- **winston** (3.19.0) - Logging kütüphanesi
- **dotenv** (16.6.1) - Ortam değişkenleri yönetimi

### Development Bağımlılıkları
- **jest** (29.7.0) - Test framework
- **supertest** (6.3.4) - API testing
- **nodemon** (3.1.11) - Auto-reload development
- **sequelize-cli** (6.6.5) - Migration yönetimi

### Tüm Paketleri Görüntüleme

```bash
# Tüm paketler
npm list --depth=0

# Sadece production
npm ls --omit=dev --depth=0

# Sadece development
npm ls --include=dev --depth=0
```

## Migration Durumu

Mevcut migration dosyalarının durumunu kontrol etmek için:

```bash
npx sequelize-cli db:migrate:status
```

**Mevcut migration'lar:**
- ✅ 20240101000000-create-customer.js
- ✅ 20240102000000-create-order.js
- ✅ 20240103000000-add-customer-isactive.js
- ✅ 20240104000000-add-order-foreign-key.js

## Sistem Bilgisi

Bu proje şu versiyonlarla test edilmiştir:

- **Node.js**: v22.12.0 (minimum: v14.0.0)
- **npm**: v10.9.0 (minimum: v6.0.0)
- **PostgreSQL**: v12+ önerilir
- **Sequelize CLI**: v6.6.5

Versiyonları kontrol etmek için:

```bash
node -v
npm -v
psql --version
```

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
