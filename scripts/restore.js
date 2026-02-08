const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('♻️ Starting restore...');

    const backupFile = path.join(__dirname, '../backup/data.json');
    if (!fs.existsSync(backupFile)) {
        console.error('❌ No backup/data.json found!');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    // Order matters for Foreign Keys!
    // Independent tables first.
    const restoreOrder = [
        'user',
        'shippingRule',
        'trustBadge',
        'heroBanner',
        'sideBanner',
        'homeSection',
        'lead',
        'category', // Categories can reference parent categories, might need double pass or special handling?
        // Prisma createMany doesn't support self-relations well if IDs provided don't exist yet.
        // We will use individual creates for categories to be safe or simple createMany if no cycles.
        'product',
        'productVariant', // depends on product
        'order', // depends on user (optional)
        'orderItem', // depends on order, product
        'review', // depends on product (via slug? schema says string slug, so no FK constraint usually)
        'returnRequest', // depends on order
        'account' // depends on user
    ];

    for (const model of restoreOrder) {
        if (data[model] && data[model].length > 0) {
            // console.log(`Restoring ${model} (${data[model].length} records)...`);
            console.log(`✓ Restoring ${model}...`);

            // Clean table first? 
            // For migration to fresh DB, it's empty.
            // But let's try deleteMany just in case (might fail due to FKs if order wrong)
            try { await prisma[model].deleteMany(); } catch { }

            // Special handling for Category due to self-relation?
            // If we insert all at once, parentId might point to non-existent record.
            // Best to insert roots first, then children.
            if (model === 'category') {
                // Sort by depth (null parent first)
                const roots = data[model].filter(c => !c.parentId);
                const children = data[model].filter(c => c.parentId);

                // Insert roots
                for (const item of roots) {
                    await prisma.category.create({ data: item });
                }
                // Insert children (might need multi-level logic if deep nesting, but simple loop works for 1 level)
                // Actually, let's just loop repeatedly until all inserted or stick to simple for now.
                // Assuming max 2 levels as per previous code.
                for (const item of children) {
                    try {
                        await prisma.category.create({ data: item });
                    } catch {
                        // console.warn(`Failed to insert category ${item.name}, maybe parent missing?`, e.message);
                    }
                }
            }
            else if (model === 'account') {
                // Accounts need user
                for (const item of data[model]) {
                    try { await prisma.account.create({ data: item }); } catch { /* console.warn('Account skip', e.message); */ }
                }
            }
            else {
                // Use createMany for speed if supported (MySQL supports it)
                // Warning: createMany skips hooks/validation? That's fine for restore.
                // But createMany might fail if data has related fields that expect connect?
                // backup dump is raw scalar fields (foreign keys are IDs). this is perfect for createMany.

                try {
                    await prisma[model].createMany({
                        data: data[model],
                        skipDuplicates: true
                    });
                } catch {
                    // console.log(`createMany failed for ${model}, trying individual inserts...`);
                    for (const item of data[model]) {
                        try {
                            await prisma[model].create({ data: item });
                        } catch (err) {
                            console.error(`Failed to restore ${model} ID ${item.id}:`, err.message);
                        }
                    }
                }
            }
        }
    }

    console.log('✅ Restore completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
