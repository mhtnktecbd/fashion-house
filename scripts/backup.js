const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('📦 Starting backup...');

    const data = {};

    // Define tables to backup in order of dependency if possible (though we restore in order)
    const models = [
        'user',
        'product',
        'productVariant',
        'category',
        'shippingRule',
        'homeSection',
        'trustBadge',
        'heroBanner',
        'sideBanner',
        'order',
        'orderItem',
        'review',
        'lead',
        'returnRequest',
        // 'account', 'session' - usually we don't migrate sessions, accounts might be needed for NextAuth
        'account'
    ];

    for (const model of models) {
        try {
            if (prisma[model]) {
                // console.log(`Backing up ${model}...`);
                data[model] = await prisma[model].findMany();
                console.log(`✓ ${model}`);
            }
        } catch {
            console.warn(`⚠ Could not backup ${model}`);
        }
    }

    const backupDir = path.join(__dirname, '../backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(backupDir, 'data.json'); // Main backup file for restore
    const timestampedFilename = path.join(backupDir, `data-${timestamp}.json`); // History

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    fs.writeFileSync(timestampedFilename, JSON.stringify(data, null, 2));

    console.log(`✅ Backup completed to ${filename}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
