# API Dokümantasyonu

**Proje:** Mini-CRM Sistemi  
**Base URL:** `http://localhost:3000/api`  
**Tarih:** 11 Ocak 2026

---

## İçindekiler

1. [Genel Bilgiler](#genel-bilgiler)
2. [Müşteri API](#müşteri-api)
3. [Ürün API](#ürün-api)
4. [Sipariş API](#sipariş-api)
5. [Hata Kodları](#hata-kodları)

---

## Genel Bilgiler

### Response Format

**Başarılı:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Hatalı:**
```json
{
  "success": false,
  "error": {
    "message": "Hata açıklaması",
    "field": "hatali_alan",
    "code": "ERROR_CODE"
  }
}
```

### Pagination

Listeleme endpoint'lerinde:
- `page` (default: 1)
- `limit` (default: 50)

Response:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "pages": 2
    }
  }
}
```

---

## Müşteri API

### Liste

**GET** `/api/customers`

**Query Parameters:**
- `page` (number) - Sayfa numarası
- `limit` (number) - Sayfa başına kayıt
- `isActive` (boolean) - Sadece aktif müşteriler

**Örnek:**
```bash
GET /api/customers?page=1&limit=20&isActive=true
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "firstName": "Ahmet",
        "lastName": "Yılmaz",
        "email": "ahmet@example.com",
        "phone": "+905551234567",
        "address": "İstanbul",
        "isActive": true,
        "createdAt": "2026-01-10T10:00:00.000Z",
        "updatedAt": "2026-01-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

### Detay

**GET** `/api/customers/:id`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet@example.com",
    "phone": "+905551234567",
    "address": "İstanbul",
    "isActive": true,
    "createdAt": "2026-01-10T10:00:00.000Z",
    "updatedAt": "2026-01-10T10:00:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": {
    "message": "Customer not found",
    "code": "NOT_FOUND"
  }
}
```

---

### Oluştur

**POST** `/api/customers`

**Request Body:**
```json
{
  "firstName": "Mehmet",
  "lastName": "Demir",
  "email": "mehmet@example.com",
  "phone": "05551234567",
  "address": "Ankara"
}
```

**Zorunlu Alanlar:**
- `firstName` (string)
- `email` VEYA `phone` (en az biri)

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "firstName": "Mehmet",
    "lastName": "Demir",
    "email": "mehmet@example.com",
    "phone": "+905551234567",
    "address": "Ankara",
    "isActive": true,
    "createdAt": "2026-01-11T12:00:00.000Z",
    "updatedAt": "2026-01-11T12:00:00.000Z"
  }
}
```

**Response 400 (Validation Error):**
```json
{
  "success": false,
  "error": {
    "message": "First name is required",
    "field": "firstName",
    "code": "VALIDATION_ERROR"
  }
}
```

---

### Güncelle

**PUT** `/api/customers/:id`

**Request Body:**
```json
{
  "lastName": "Yıldız",
  "phone": "05559876543"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Ahmet",
    "lastName": "Yıldız",
    "email": "ahmet@example.com",
    "phone": "+905559876543",
    ...
  }
}
```

---

### Sil (Soft Delete)

**DELETE** `/api/customers/:id`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Customer deactivated successfully"
  }
}
```

---

## Ürün API

### Liste

**GET** `/api/products`

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `isActive` (boolean)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Laptop",
        "description": "Gaming laptop",
        "sku": "LAP-001",
        "basePrice": "15000.00",
        "stockQuantity": 25,
        "trackInventory": true,
        "isActive": true,
        "createdAt": "2026-01-10T10:00:00.000Z",
        "updatedAt": "2026-01-10T10:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Detay

**GET** `/api/products/:id`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "Gaming laptop",
    "sku": "LAP-001",
    "basePrice": "15000.00",
    "stockQuantity": 25,
    "trackInventory": true,
    "isActive": true,
    "ProductPrices": [
      {
        "id": 1,
        "priceType": "wholesale",
        "price": "14000.00",
        "minQuantity": 5,
        "isActive": true
      }
    ]
  }
}
```

---

### Oluştur

**POST** `/api/products`

**Request Body:**
```json
{
  "name": "Klavye",
  "description": "Mekanik klavye",
  "sku": "KB-001",
  "basePrice": 500,
  "stockQuantity": 100,
  "trackInventory": true
}
```

**Zorunlu Alanlar:**
- `name` (string)
- `basePrice` (number)

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Klavye",
    ...
  }
}
```

---

### Stok Güncelle

**PATCH** `/api/products/:id/stock`

**Request Body:**
```json
{
  "quantity": 10,
  "operation": "add"
}
```

**Operations:**
- `add` - Stok ekle
- `subtract` - Stok azalt
- `set` - Stok belirle

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "stockQuantity": 35
  }
}
```

---

### Stok Kontrolü

**GET** `/api/products/:id/check-stock?quantity=10`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "stockQuantity": 25,
    "requestedQuantity": 10
  }
}
```

---

### Fiyat Ekle

**POST** `/api/products/:id/prices`

**Request Body:**
```json
{
  "priceType": "wholesale",
  "price": 14000,
  "minQuantity": 5
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "productId": 1,
    "priceType": "wholesale",
    "price": "14000.00",
    "minQuantity": 5,
    "isActive": true
  }
}
```

---

### Fiyat Hesapla

**GET** `/api/products/:id/calculate-price?quantity=10`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "unitPrice": "14000.00",
    "quantity": 10,
    "total": "140000.00",
    "priceType": "wholesale"
  }
}
```

---

## Sipariş API

### Liste

**GET** `/api/orders`

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (string) - pending, preparing, shipped, delivered, cancelled, backordered
- `customerId` (number)

**Örnek:**
```bash
GET /api/orders?status=pending&customerId=1
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "customerId": 1,
        "status": "pending",
        "totalAmount": "15000.00",
        "createdAt": "2026-01-11T10:00:00.000Z",
        "updatedAt": "2026-01-11T10:00:00.000Z",
        "Customer": {
          "id": 1,
          "firstName": "Ahmet",
          "lastName": "Yılmaz"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Detay

**GET** `/api/orders/:id`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 1,
    "status": "pending",
    "totalAmount": "15000.00",
    "createdAt": "2026-01-11T10:00:00.000Z",
    "updatedAt": "2026-01-11T10:00:00.000Z",
    "Customer": {
      "id": 1,
      "firstName": "Ahmet",
      "lastName": "Yılmaz",
      "email": "ahmet@example.com",
      "phone": "+905551234567"
    },
    "OrderItems": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 1,
        "unitPrice": "15000.00",
        "subtotal": "15000.00",
        "Product": {
          "id": 1,
          "name": "Laptop"
        }
      }
    ]
  }
}
```

---

### Oluştur (Mevcut Müşteri)

**POST** `/api/orders`

**Request Body:**
```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "customerId": 1,
    "status": "pending",
    "totalAmount": "30500.00",
    ...
  }
}
```

---

### Oluştur (Guest Müşteri)

**POST** `/api/orders`

**Request Body:**
```json
{
  "customer": {
    "firstName": "Ali",
    "lastName": "Kara",
    "email": "ali@example.com",
    "phone": "05551112233"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 1
    }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "customerId": 5,
    "status": "pending",
    "totalAmount": "15000.00",
    "Customer": {
      "id": 5,
      "firstName": "Ali",
      "lastName": "Kara",
      "email": "ali@example.com",
      "phone": "+905551112233"
    }
  }
}
```

---

### Durum Güncelle

**PATCH** `/api/orders/:id/status`

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Geçerli Durumlar:**
- `pending`
- `preparing`
- `shipped`
- `delivered`
- `cancelled`
- `backordered`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "shipped",
    ...
  }
}
```

---

## Hata Kodları

| Kod | HTTP Status | Açıklama |
|-----|-------------|----------|
| `VALIDATION_ERROR` | 400 | Girdi validasyon hatası |
| `NOT_FOUND` | 404 | Kayıt bulunamadı |
| `DUPLICATE` | 400 | Duplicate kayıt |
| `INSUFFICIENT_STOCK` | 400 | Yetersiz stok |
| `INVALID_OPERATION` | 400 | Geçersiz işlem |
| `INTERNAL_ERROR` | 500 | Sunucu hatası |

---

## Örnek Senaryolar

### Senaryo 1: Yeni Müşteri ve Sipariş

```bash
# 1. Müşteri oluştur
POST /api/customers
{
  "firstName": "Ayşe",
  "email": "ayse@example.com",
  "phone": "05559876543"
}

# Response: { "data": { "id": 10, ... } }

# 2. Sipariş oluştur
POST /api/orders
{
  "customerId": 10,
  "items": [
    { "productId": 1, "quantity": 1 }
  ]
}
```

---

### Senaryo 2: Guest Sipariş

```bash
POST /api/orders
{
  "customer": {
    "firstName": "Mehmet",
    "phone": "05551234567"
  },
  "items": [
    { "productId": 2, "quantity": 3 }
  ]
}
```

---

### Senaryo 3: Stok Yönetimi

```bash
# 1. Stok kontrolü
GET /api/products/1/check-stock?quantity=10

# 2. Stok ekle
PATCH /api/products/1/stock
{
  "quantity": 50,
  "operation": "add"
}

# 3. Sipariş (otomatik stok azalır)
POST /api/orders
{
  "customerId": 1,
  "items": [
    { "productId": 1, "quantity": 5 }
  ]
}
```

---

**Son Güncelleme:** 11 Ocak 2026  
**Versiyon:** 1.0
