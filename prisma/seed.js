const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    try {
        // 1. Shipping Rules (Upsert)
        console.log('✔ Seeding Shipping Rules...');
        await prisma.shippingRule.upsert({
            where: { name: 'default' },
            update: {}, // No update if exists, to preserve user changes
            create: {
                name: 'default',
                enabled: true,
                codEnabled: true,
                insideDhakaFee: 70,
                insideDhakaActive: true,
                insideDhakaFree: false,
                insideDhakaMin: 0,
                outsideDhakaFee: 130,
                outsideDhakaActive: true,
                outsideDhakaFree: false,
                outsideDhakaMin: 0
            }
        });

        // 2. Categories (Upsert)
        console.log('✔ Seeding Categories...');
        const categories = [
            { name: 'Men', slug: 'men', showInNavbar: true, showInHome: true, sub: ['T-Shirts', 'Jeans', 'Shirts', 'Shoes'] },
            { name: 'Women', slug: 'women', showInNavbar: true, showInHome: true, sub: ['Dresses', 'Tops', 'Bags', 'Shoes'] },
            { name: 'Kids', slug: 'kids', showInNavbar: true, showInHome: true, sub: ['Boys', 'Girls', 'Toys'] },
            { name: 'Sports', slug: 'sports', showInNavbar: true, showInHome: true, sub: ['Jerseys', 'Equipment', 'Activewear'] },
            { name: 'Accessories', slug: 'accessories', showInNavbar: true, showInHome: false, sub: ['Watches', 'Belts', 'Wallets'] }
        ];

        for (const cat of categories) {
            const createdCat = await prisma.category.upsert({
                where: { slug: cat.slug },
                update: {}, // Preserve existing
                create: {
                    name: cat.name,
                    slug: cat.slug,
                    showInNavbar: cat.showInNavbar,
                    showInHome: cat.showInHome,
                    isActive: true
                }
            });

            if (cat.sub && cat.sub.length > 0) {
                for (const subName of cat.sub) {
                    const subSlug = `${cat.slug}-${subName.toLowerCase().replace(/\s+/g, '-')}`;
                    await prisma.category.upsert({
                        where: { slug: subSlug },
                        update: {},
                        create: {
                            name: subName,
                            slug: subSlug,
                            isActive: true,
                            parentId: createdCat.id,
                            showInNavbar: false
                        }
                    });
                }
            }
        }

        // 3. Products (Upsert by slug)
        console.log('✔ Seeding Products...');
        const productsData = [
            {
                title: 'Men’s Classic T-Shirt',
                slug: 'mens-classic-t-shirt',
                price: 500,
                description: 'A comfortable classic t-shirt for men. 100% Cotton.',
                category: 'Men',
                images: JSON.stringify(['/images/products/shirt-1.jpg']),
                stock: 50,
                sizes: JSON.stringify(['M', 'L', 'XL']),
                variants: [
                    { size: 'M', color: 'White', stock: 20 },
                    { size: 'L', color: 'White', stock: 15 },
                    { size: 'XL', color: 'White', stock: 15 },
                    { size: 'M', color: 'Black', stock: 10 }
                ]
            },
            {
                title: 'Women’s Summer Dress',
                slug: 'womens-summer-dress',
                price: 1800,
                description: 'Light and airy dress for summer. Floral pattern.',
                category: 'Women',
                images: JSON.stringify(['/images/products/dress-1.jpg']),
                stock: 30,
                sizes: JSON.stringify(['S', 'M', 'L']),
                variants: [
                    { size: 'S', color: 'Red', stock: 10 },
                    { size: 'M', color: 'Red', stock: 10 },
                    { size: 'L', color: 'Red', stock: 10 }
                ]
            },
            {
                title: 'Unisex Cap',
                slug: 'unisex-cap',
                price: 350,
                description: 'Stylish cap for everyone.',
                category: 'Accessories',
                images: JSON.stringify(['/images/products/cap-1.jpg']),
                stock: 100,
                sizes: JSON.stringify(['One Size']),
                variants: [
                    { size: 'One Size', color: 'Black', stock: 50 },
                    { size: 'One Size', color: 'Blue', stock: 50 }
                ]
            }
        ];

        for (const p of productsData) {

            const product = await prisma.product.upsert({
                where: { slug: p.slug },
                update: {}, // Preserve existing
                create: {
                    title: p.title,
                    slug: p.slug,
                    price: p.price,
                    description: p.description,
                    category: p.category,
                    images: p.images,
                    stock: p.stock,
                    sizes: p.sizes,
                    isNew: true,
                    isOnSale: false
                }
            });

            // Create Variants if product was created or if needed. 
            // For simplicity in seed, we might skip variant update if product exists.
            // Or we can try to upsert variants? ProductVariant doesn't have a unique slug.
            // Let's just create variants only if we created the product (simplification).
            // But upsert returns the object. We can check createdAt vs updatedAt? 
            // Better: Check if variants exist.

            const variantCount = await prisma.productVariant.count({ where: { productId: product.id } });

            if (variantCount === 0 && p.variants) {
                for (const v of p.variants) {
                    await prisma.productVariant.create({
                        data: {
                            productId: product.id,
                            size: v.size,
                            color: v.color,
                            stock: v.stock
                        }
                    });
                }
            }
        }

        console.log('✔ Seeding completed!');

    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
