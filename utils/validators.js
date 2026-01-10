/*
bu dosyadaprojede daha önce dagınık sekilde yapılan email ve telefon kontrolleri
tek bir yerde toplandı. Önceden email formatı ve telefon numarası için
herhangi bir dogrulama veya normalizasyon bulunmuyordu ve bu durum hatalı
verilerin sisteme girmesine neden olabiliyordu

Yapılan düzenleme ile email doğrulama ve telefon numarasını standart
bir formata çeviren yardımcı fonksiyonlar eklendi. Böylece kod tekrarı
azaltıldı, veri kalitesi artırıldı ve özellikle ETL sürecinde ihtiyaç
duyulan temiz veri yapısı sağlanmış oldu
*/


// Email formatını kontrol etmek
function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// Telefon numarasını +90XXXXXXXXXX formatına çevirmek
function normalizePhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return null;
    }

    // Sadece rakamları almak
    let digits = phone.replace(/\D/g, '');

    // Türkiye kodu varsa kaldırmak
    if (digits.startsWith('90')) {
        digits = digits.substring(2);
    }

    // Başındaki 0'ı kaldırmak
    if (digits.startsWith('0')) {
        digits = digits.substring(1);
    }

    // 10 haneli değilse geçersiz
    if (digits.length !== 10) {
        return null;
    }

    return `+90${digits}`;
}

// İsim alanındaki gereksiz karakterleri temizlemek
function sanitizeName(name) {
    if (!name || typeof name !== 'string') {
        return '';
    }

    let cleaned = name.trim();
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned;
}

// Standart validation hatası üretmek
function createValidationError(message, field = null) {
    const error = new Error(message);
    error.statusCode = 400;
    error.field = field;
    return error;
}

module.exports = {
    isValidEmail,
    normalizePhone,
    sanitizeName,
    createValidationError
};
