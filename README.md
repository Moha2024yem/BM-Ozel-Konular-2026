# Mini-CRM - Müşteri ve Sipariş Yönetim Sistemi

**Proje Tipi:** Yazılım Mühendisliği Tamamlama Projesi  

---

## Dokümantasyon

Bu proje kapsamlı dokümantasyona sahiptir. Detaylı bilgi için ilgili dokümanları inceleyebilirsiniz:

### Ana Dokümanlar

| Doküman | Açıklama | Link |
|---------|----------|------|
| **Gereksinim Analizi** | Müşteri talepleri ve netleştirme süreci | [GEREKSINIM_ANALIZI.md](docs/GEREKSINIM_ANALIZI.md) |
| **Mimari Tasarım** | Sistem mimarisi, veritabanı şeması, UML | [ MIMARI_TASARIM.md](docs/MIMARI_TASARIM.md) |
| **API Dokümantasyonu** | Tüm endpoint'ler ve kullanım örnekleri | [ API.md](docs/API.md) |
| **Veri Klasörü** | CSV import ve veri yönetimi | [ data/README.md](data/README.md) |

---

### Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını oluştur
copy .env.example .env

# 3. Veritabanı oluştur
# PostgreSQL'de:
CREATE DATABASE mini_crm_dev;

# 4. Migration'ları çalıştır
npm run migrate

# 5. Sunucuyu başlat
npm start
```

Sunucu `http://localhost:3000` adresinde çalışacaktır.

---

## Özellikler

### Müşteri Yönetimi
-  CRUD operasyonları
-  Email/telefon validation
-  Duplicate kontrolü
-  Soft delete
-  CSV toplu import

### Ürün Yönetimi
-  CRUD operasyonları
-  Stok takibi (opsiyonel)
-  Çoklu fiyatlandırma
-  SKU yönetimi

### Sipariş Yönetimi
-  Guest müşteri desteği
-  Otomatik stok entegrasyonu
-  Durum yönetimi
-  Sipariş kalemleri

### Altyapı
-  RESTful API
-  Migration-based database
-  Winston logging
-  Kapsamlı testler
-  Konfigürasyon yönetimi

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Sequelize |
| Logging | Winston |
| Testing | Jest + Supertest |
| Environment | dotenv |

---

## API Kullanımı

### Müşteri Listesi
```bash
GET /api/customers?page=1&limit=50
```

### Ürün Oluştur
```bash
POST /api/products
{
  "name": "Laptop",
  "basePrice": 15000,
  "stockQuantity": 25
}
```

### Sipariş (Guest Müşteri)
```bash
POST /api/orders
{
  "customer": {
    "firstName": "Ahmet",
    "email": "ahmet@example.com"
  },
  "items": [
    {"productId": 1, "quantity": 2}
  ]
}
```

**Detaylı API dokümantasyonu için:** [API.md](docs/API.md)

---

## Test

```bash
# Tüm testleri çalıştır
npm test

Test Suites: 6 passed, 6 total                                                                                                                                                        
Tests:       48 passed, 48 total
Snapshots:   0 total
Time:        8.251 s
```

---

## Proje Yapısı

```
BM-Ozel-Konular-2026-2/
├── docs/                    #  Dokümantasyon
│   ├── GEREKSINIM_ANALIZI.md
│   ├── MIMARI_TASARIM.md
│   └── API.md
├── data/                    #  CSV veri dosyaları
├── migrations/              #  Veritabanı migration'ları
├── src/
│   ├── routes/              #  API endpoint'leri
│   ├── services/            #  İş mantığı
│   ├── models/              #  Veritabanı modelleri
│   ├── middleware/          #  Express middleware
│   ├── utils/               #  Yardımcı fonksiyonlar
│   └── lib/                 #  Kütüphaneler (logger)
├── tests/                   #  Test dosyaları
├── scripts/                 #  ETL scriptleri
└── README.md                #  Bu dosya
```

**Detaylı mimari bilgi için:** [MIMARI_TASARIM.md](docs/MIMARI_TASARIM.md)

---

## Veritabanı

### Migration Durumu
```bash
# Durumu kontrol et
npx sequelize-cli db:migrate:status

# Çıktı:
#  up 20240101000000-create-customer.js
#  up 20240102000000-create-order.js
#  up 20260111000000-create-products.js
#  up 20260111000001-create-product-prices.js
#  up 20260111000002-create-order-items.js
```

### Tablolar
- `customers` - Müşteriler
- `products` - Ürünler
- `product_prices` - Çoklu fiyatlar
- `orders` - Siparişler
- `order_items` - Sipariş kalemleri

**Detaylı şema için:** [MIMARI_TASARIM.md](docs/MIMARI_TASARIM.md#veritabanı-şeması)

---

##  CSV Import

```bash
# Varsayılan dosya
node scripts/import-customers.js

# Özel dosya
node scripts/import-customers.js data/my_customers.csv
```

**Detaylar için:** [data/README.md](data/README.md)

---

##  Konfigürasyon

Tüm ayarlar `.env` dosyasında:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_crm_dev
DB_USER=postgres
DB_PASS=your_password
APP_PORT=3000
LOG_LEVEL=debug
```

---

##  Scripts

| Komut | Açıklama |
|-------|----------|
| `npm start` | Sunucuyu başlat (production) |
| `npm run dev` | Development modda başlat |
| `npm test` | Testleri çalıştır |
| `npm run migrate` | Migration'ları uygula |

---

**Detaylı analiz için:** [GEREKSINIM_ANALIZI.md](docs/GEREKSINIM_ANALIZI.md)

---


**Hazırlayan:** 
MOHAMMED ABDULRAHMAN ABDO ABDULLAH AL-HAMIDI 245112073

---
**Code Review Yapanlar:**  
- Burak Ünal – 245172017  
- Salih Kızılkaya – 245172026
- [Issues](https://github.com/Moha2024yem/BM-Ozel-Konular-2026/issues)



---

##  Hızlı Linkler

-  [Gereksinim Analizi](docs/GEREKSINIM_ANALIZI.md)
-  [Mimari Tasarım](docs/MIMARI_TASARIM.md)
-  [API Dokümantasyonu](docs/API.md)
-  [Veri Yönetimi](data/README.md)

---
Bu proje eğitim amaçlı geliştirilmiştir.
