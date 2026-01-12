# Code Review Form
Hazırlayan
Salih Kızılkaya Öğr No: 245172026

Genel Mimari ve Yapı
Proje, Node.js ve Express framework'ü kullanılarak geliştirilmiş, katmanlı bir mimariye (Routes -> Services -> Models) sahiptir. Bu yapı, iş mantığının (business logic) API uçlarından ayrılmasını sağlayarak kodun okunabilirliğini ve test edilebilirliğini artırmaktadır.
Bileşen Durum Gözlem
Klasör Yapısı ✅ Başarılı Standart Express yapısına uygun, modüler ve düzenli.
Servis Katmanı ✅ Başarılı İş mantığı servislerde toplanmış, route'lar temiz tutulmuş.
Veritabanı (ORM) ✅ Başarılı Sequelize kullanımı ve migration yapısı doğru kurgulanmış.
Loglama ✅ Başarılı Winston ile Trace ID bazlı, seviyeli ve dosya destekli loglama yapılmış.
2. Kod Kalitesi ve İş Mantığı
Kod genel olarak temiz ve yorum satırlarıyla desteklenmiş. Özellikle validators.js ve requestLogger.js gibi yardımcı bileşenlerin eklenmesi projenin olgunluğunu göstermektedir.

Güçlü Yönler:
• Trace ID Kullanımı: Her isteğe benzersiz bir ID atanması, hata takibini (debugging) son derece kolaylaştırmaktadır.
• Veri Normalizasyonu: Telefon numaralarının standart bir formata (+90) getirilmesi veri kalitesini artırmaktadır.
• Pagination: Müşteri listeleme uçlarında sayfalama desteği bulunması performans açısından kritiktir.
• ETL Süreci: CSV'den veri aktarımı için hazırlanan script, hata raporlama ve duplicate kontrolü ile profesyonelce hazırlanmış.

Geliştirilmesi Gereken Alanlar:
• Model-Migration Tutarsızlığı: customer.js modelinde isActive alanı bulunurken, bazı migration dosyalarında bu alanın eksik olduğu veya sonradan eklendiği görülmektedir.
• Eksik İlişkiler: Sipariş (Order) tablosunda customerId için foreign key kısıtlaması (constraint) model seviyesinde belirtilmiş ancak migration tarafında eksiklikler olabilir.
• Sipariş Kalemleri: Siparişlerin şu an için sadece bir toplam tutarı var; ürün bazlı sipariş kalemleri (OrderItems) tablosu eksik.

Güvenlik ve Hata Yönetimi
Hata yönetimi merkezi bir middleware üzerinden yapılarak tutarlı bir response formatı sağlanmış.
Risk Alanı Durum Öneri
Input Validasyonu ⚠️ Orta validators.js temel kontrolleri yapıyor ancak joi veya zod gibi bir kütüphane ile daha katı şema doğrulaması yapılabilir.
Hata Mesajları ✅ Başarılı Development ortamında stack trace gösterilirken, production'da gizlenmesi güvenli bir yaklaşım.
Duplicate Kontrolü ⚠️ Düşük customerService.js içinde duplicate kontrolü yapılıyor ancak sadece log atılıyor; iş kuralına göre bu işlem engellenebilir.
4. Test ve Kalite Kontrol
Jest ve Supertest kullanımı ile API testlerinin kurgulanmış olması projenin güvenilirliğini artırmaktadır. tests/setup.js ile test ortamının izole edilmesi doğru bir yaklaşımdır.

Sonuç ve Öneriler
Proje, bir "Mini CRM" sistemi için oldukça sağlam bir temele sahiptir. Mimari kararlar ve kullanılan araçlar modern web geliştirme standartlarıyla uyumludur.
Kritik Öneriler:
1 Şema Doğrulama: API istekleri için express-validator veya zod entegrasyonu yapılmalı.
2 Sipariş Detayları: Siparişlerin hangi ürünleri içerdiğini takip etmek için OrderItems tablosu eklenmeli.
3 Dokümantasyon: API uçlarını test etmek için Swagger (OpenAPI) entegrasyonu yapılmalı.
4 Soft Delete: Müşteri silme işleminde kullanılan isActive mantığı, tüm sorgularda (findAll vb.) varsayılan filtre olarak uygulanmalı.


## CODE REVİEW

Yapan: Burak Ünal 245172017


PROJE ÖZETİ
Bu proje, akademik kapsamda hazırlanmış, yazılım mühendisliği prensiplerini
uygulamayı amaçlayan bir çalışmadır. Node.js tabanlı bir yapı ve modüler
klasör organizasyonu hedeflenmiştir.

GÜÇLÜ YÖNLER
1. Düzenli klasör yapısı (src, tests, docs, migrations vb.)
2. README.md ve REVIEW.md dosyalarının bulunması
3. .env.example dosyası ile ortam değişkenlerinin ayrılması
4. Migration yapısının kullanılması
5. Akademik proje formatına uygunluk

ZAYIF YÖNLER
1. README içeriği teknik açıdan yeterince detaylı değil
2. API endpoint açıklamaları ve örnekleri eksik
3. Test kapsamı sınırlı veya belirsiz
4. Merkezi hata yönetimi net değil
5. Güvenlik ve kimlik doğrulama mekanizmaları eksik

EKSİKLER
- Swagger / OpenAPI dokümantasyonu
- JWT veya benzeri authentication yapısı
- CI/CD pipeline (GitHub Actions)
- Kod standartlarını denetleyen ESLint / Prettier

İYİLEŞTİRME ÖNERİLERİ
- Request validation için Joi veya Zod kullanılması
- Error handling middleware eklenmesi
- Testlerin unit ve integration olarak ayrılması
- GitHub Actions ile otomatik test çalıştırılması
- README dosyasının teknik detaylarla zenginleştirilmesi

GENEL DEĞERLENDİRME
Bu proje, ders kapsamında iyi bir temel oluşturmaktadır.
Eksiklerin giderilmesi halinde gerçek hayata daha yakın,
bakımı kolay ve ölçeklenebilir bir yazılım haline getirilebilir.


