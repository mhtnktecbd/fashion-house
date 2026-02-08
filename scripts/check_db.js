const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const productCount = await prisma.product.count();
        const categoryCount = await prisma.category.count();
        const shippingRuleCount = await prisma.shippingRule.count();
        console.log(`✔ DB Check: ${productCount} Products, ${categoryCount} Categories, ${shippingRuleCount} Shipping Rules`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
