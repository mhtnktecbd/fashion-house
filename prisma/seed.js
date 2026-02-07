const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Clean up existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    console.log('🧹 Cleared existing data');

    // 2. Create Categories
    const menCategory = await prisma.category.create({
        data: { name: 'Men', slug: 'men', showInNavbar: true, isActive: true }
    });

    const womenCategory = await prisma.category.create({
        data: { name: 'Women', slug: 'women', showInNavbar: true, isActive: true }
    });

    console.log('✅ Created Categories');

    // 3. Create Products
    const productsData = [
        {
            title: 'Men’s Classic T-Shirt',
            slug: 'mens-classic-t-shirt',
            price: 500,
            description: 'A comfortable classic t-shirt for men.',
            category: 'Men',
            images: JSON.stringify(['/images/placeholder.jpg']),
            stock: 50,
            sizes: JSON.stringify(['M', 'L', 'XL'])
        },
        {
            title: 'Men’s Denim Jacket',
            slug: 'mens-denim-jacket',
            price: 2500,
            description: 'Stylish denim jacket.',
            category: 'Men',
            images: JSON.stringify(['/images/placeholder.jpg']),
            stock: 20,
            sizes: JSON.stringify(['L', 'XL'])
        },
        {
            title: 'Women’s Summer Dress',
            slug: 'womens-summer-dress',
            price: 1800,
            description: 'Light and airy dress for summer.',
            category: 'Women',
            images: JSON.stringify(['/images/placeholder.jpg']),
            stock: 35,
            sizes: JSON.stringify(['S', 'M', 'L'])
        },
        {
            title: 'Women’s Handbag',
            slug: 'womens-handbag',
            price: 3200,
            description: 'Premium leather handbag.',
            category: 'Women',
            images: JSON.stringify(['/images/placeholder.jpg']),
            stock: 15,
            sizes: JSON.stringify([])
        },
        {
            title: 'Unisex Cap',
            slug: 'unisex-cap',
            price: 300,
            description: 'Cotton cap for daily wear.',
            category: 'Men',
            images: JSON.stringify(['/images/placeholder.jpg']),
            stock: 100,
            sizes: JSON.stringify(['One Size'])
        }
    ];

    const products = [];
    for (const p of productsData) {
        const product = await prisma.product.create({ data: p });
        products.push(product);
    }
    console.log(`✅ Created ${products.length} Products`);

    // 4. Create Orders
    const order1 = await prisma.order.create({
        data: {
            orderNumber: 1001,
            guestName: 'John Doe',
            guestPhone: '01711223344',
            guestAddress: '123 Dhaka Street',
            totalAmount: 3000,
            paymentMethod: 'cod',
            status: 'PENDING',
            items: {
                create: [
                    {
                        productId: products[0].id,
                        quantity: 2,
                        price: products[0].price,
                        title: products[0].title,
                        size: 'L'
                    },
                    {
                        productId: products[1].id,
                        quantity: 1,
                        price: products[1].price,
                        title: products[1].title,
                        size: 'XL'
                    }
                ]
            }
        }
    });

    const order2 = await prisma.order.create({
        data: {
            orderNumber: 1002,
            guestName: 'Jane Smith',
            guestPhone: '01888999000',
            guestAddress: '456 Chittagong Road',
            totalAmount: 1800,
            paymentMethod: 'bkash',
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            items: {
                create: [
                    {
                        productId: products[2].id,
                        quantity: 1,
                        price: products[2].price,
                        title: products[2].title,
                        size: 'M'
                    }
                ]
            }
        }
    });

    console.log('✅ Created 2 Orders');
    console.log('🚀 Seed finished successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
