/*
Bu dosyada CSV dosyasından müşteri verilerinin sisteme aktarılması için
bir ETL süreci uygulanmaktadır. Script kapsamında veri temizleme ve
normalizasyon işlemleri gerçekleştirilmekte, telefon numaraları ve
email adresleri doğrulanmakta ve duplicate kayıtlar tespit edilmektedir.

Geçerli kayıtlar veritabanına yazılırken, hatalı veya duplicate olarak
belirlenen kayıtlar ayrıştırılarak etl-errors.log dosyasına raporlanmaktadır.
*/

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Customer, sequelize } = require('../src/models');
const { isValidEmail, normalizePhone, sanitizeName } = require('../src/utils/validators');
const logger = require('../src/lib/logger');


//CSV dosyasından müşteri verileriini import eder

async function importCustomers(csvFilePath) {
    console.log(`\nETL Script Başlatıldı: ${new Date().toISOString()}\n`);
    console.log(`CSV Dosyası: ${csvFilePath}\n`);

    // CSV dosyasını okumak
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    console.log(`Toplam Kayıt Sayısı: ${records.length}\n`);

    const results = {
        total: records.length,
        successful: 0,
        failed: 0,
        duplicates: 0,
        errors: []
    };

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2; // CSV header + 0-index

        try {
            // Veri temizlemek ve validation
            const cleanedData = await cleanAndValidateRecord(record, rowNumber);

            if (!cleanedData.valid) {
                results.failed++;
                results.errors.push({
                    row: rowNumber,
                    data: record,
                    errors: cleanedData.errors
                });
                continue;
            }

            // Duplicate kontrolü
            const isDuplicate = await checkDuplicate(cleanedData.email, cleanedData.phone);

            if (isDuplicate) {
                results.duplicates++;
                results.errors.push({
                    row: rowNumber,
                    data: record,
                    errors: ['Duplicate: Email or phone already exists']
                });
                console.log(`[Satır ${rowNumber}] DUPLICATE: ${cleanedData.firstName} ${cleanedData.lastName || ''}`);
                continue;
            }

            // Veritabanına kaydetmek
            await Customer.create({
                firstName: cleanedData.firstName,
                lastName: cleanedData.lastName,
                email: cleanedData.email,
                phone: cleanedData.phone,
                address: cleanedData.address,
                isActive: true
            });

            results.successful++;
            console.log(`[Satır ${rowNumber}] ✓ BAŞARILI: ${cleanedData.firstName} ${cleanedData.lastName || ''}`);

        } catch (error) {
            results.failed++;
            results.errors.push({
                row: rowNumber,
                data: record,
                errors: [error.message]
            });
            console.log(`[Satır ${rowNumber}] ✗ HATA: ${error.message}`);
        }
    }

    // Rapor oluşturmak
    generateReport(results);

    console.log(`\n=== ETL Script Tamamlandı ===`);
    console.log(`Toplam: ${results.total}`);
    console.log(`Başarılı: ${results.successful}`);
    console.log(`Başarısız: ${results.failed}`);
    console.log(`Duplicate: ${results.duplicates}\n`);

    return results;
}


//Kayıt temizleme ve validation

async function cleanAndValidateRecord(record, rowNumber) {
    const errors = [];
    const cleaned = {};

    // Ad (Zorunlu)
    const firstName = record['Ad'] || record['ad'] || record['firstName'];
    if (!firstName || !firstName.trim()) {
        errors.push('First name is required');
    } else {
        cleaned.firstName = sanitizeName(firstName);
    }

    // Soyad (Opsiyonel)
    const lastName = record['Soyad'] || record['soyad'] || record['lastName'];
    cleaned.lastName = lastName ? sanitizeName(lastName) : null;

    // Email
    const email = record['Email'] || record['email'];
    if (email && email.trim()) {
        if (isValidEmail(email)) {
            cleaned.email = email.trim().toLowerCase();
        } else {
            errors.push(`Invalid email format: ${email}`);
            cleaned.email = null;
        }
    } else {
        cleaned.email = null;
    }

    // Telefon
    const phone = record['Telefon'] || record['telefon'] || record['phone'];
    if (phone && phone.trim()) {
        const normalized = normalizePhone(phone);
        if (normalized) {
            cleaned.phone = normalized;
        } else {
            errors.push(`Invalid phone format: ${phone}`);
            cleaned.phone = null;
        }
    } else {
        cleaned.phone = null;
    }

    // Adres
    const address = record['Adres'] || record['adres'] || record['address'];
    cleaned.address = address && address.trim() !== '-' ? address.trim() : null;

    // En az email veya telefon gerekli
    if (!cleaned.email && !cleaned.phone) {
        errors.push('At least email or phone is required');
    }

    return {
        valid: errors.length === 0,
        errors,
        ...cleaned
    };
}

//Duplicate kontrolü
async function checkDuplicate(email, phone) {
    if (!email && !phone) {
        return false;
    }

    const whereConditions = [];
    if (email) whereConditions.push({ email });
    if (phone) whereConditions.push({ phone });

    const existing = await Customer.findOne({
        where: {
            [sequelize.Sequelize.Op.or]: whereConditions
        }
    });

    return existing !== null;
}

//Hata raporu oluşturmak
function generateReport(results) {
    if (results.errors.length === 0) {
        console.log('\n✓ Tüm kayıtlar başarıyla import edildi, hata yok.\n');
        return;
    }

    const reportPath = path.join(process.cwd(), 'etl-errors.log');
    let reportContent = `ETL Hata Raporu\n`;
    reportContent += `Tarih: ${new Date().toISOString()}\n`;
    reportContent += `=`.repeat(80) + '\n\n';

    reportContent += `ÖZET:\n`;
    reportContent += `- Toplam kayıt: ${results.total}\n`;
    reportContent += `- Başarılı: ${results.successful}\n`;
    reportContent += `- Başarısız: ${results.failed}\n`;
    reportContent += `- Duplicate: ${results.duplicates}\n\n`;

    reportContent += `=`.repeat(80) + '\n\n';
    reportContent += `HATALI KAYITLAR:\n\n`;

    results.errors.forEach((error, index) => {
        reportContent += `${index + 1}. Satır ${error.row}:\n`;
        reportContent += `   Veri: ${JSON.stringify(error.data)}\n`;
        reportContent += `   Hatalar:\n`;
        error.errors.forEach(err => {
            reportContent += `   - ${err}\n`;
        });
        reportContent += `\n`;
    });

    fs.writeFileSync(reportPath, reportContent, 'utf-8');
    console.log(`\n Hata raporu oluşturuldu: ${reportPath}\n`);
}

// Script çalıştırma
if (require.main === module) {
    const csvFile = process.argv[2] || 'data/customers_raw_ordered.csv';

    if (!fs.existsSync(csvFile)) {
        console.error(`! Hata: CSV dosyası bulunamadı: ${csvFile}`);
        console.log(`\nİpucu: CSV dosyalarını 'data/' klasörüne koyun.`);
        process.exit(1);
    }

    sequelize.authenticate()
        .then(() => {
            console.log('✓ Veritabanı bağlantısı başarılı\n');
            return importCustomers(csvFile);
        })
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('! Kritik hata:', error);
            process.exit(1);
        });
}

module.exports = { importCustomers };
