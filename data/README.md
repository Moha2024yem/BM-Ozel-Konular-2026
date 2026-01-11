# Data Klasörü

Bu klasör CSV veri dosyalarını içerir.

## Dosyalar

### 📁 customers_raw_ordered.csv
ETL test dosyası - müşteri verileri (temizlenmemiş, hatalı kayıtlar içerir)

### 📁 sample_customers.csv
Örnek müşteri verileri

### 📁 sample_orders.csv
Örnek sipariş verileri

## Kullanım

### CSV dosyası import etmek:

```bash
# Varsayılan dosyayı kullan
node scripts/import-customers.js

# Belirli bir dosya kullan
node scripts/import-customers.js data/sample_customers.csv

# Kendi dosyanı kullan
node scripts/import-customers.js data/my_customers.csv
```

## CSV Formatı

### Müşteri Dosyası Format

| Sütun | Zorunlu | Örnek |
|-------|---------|-------|
| Ad | ✓ Evet | Ahmet |
| Soyad | ✗ Hayır | Yılmaz |
| Telefon | ✗ Hayır | 05551234567 |
| Email | ✗ Hayır | ahmet@mail.com |
| Adres | ✗ Hayır | Istanbul |

**Not:** En az email veya telefon gereklidir.

### Örnek CSV:

```csv
Ad,Soyad,Telefon,Email,Adres
Ahmet,Yılmaz,05551234567,ahmet@mail.com,Istanbul
Ayşe,Kara,+905559876543,ayse@mail.com,Ankara
Mehmet,,5551112233,mehmet@mail.com,Izmir
```

## Özellikler

✅ Otomatik telefon normalizasyonu (+90XXXXXXXXXX)  
✅ İsim temizleme (boşluk, tırnak işareti)  
✅ Email validasyonu  
✅ Duplicate kontrolü  
✅ Hata raporu (etl-errors.log)
