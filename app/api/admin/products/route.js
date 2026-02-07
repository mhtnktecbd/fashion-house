import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: { variants: true }
        });

        const parsedProducts = products.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
            sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
        }));

        return NextResponse.json({ success: true, products: parsedProducts });
    } catch (error) {
        console.error("Admin Products GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { title, price, description, category, images, stock, sizes, variants, isNew, isOnSale } = body;

        const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

        const product = await prisma.product.create({
            data: {
                title,
                slug,
                price: parseFloat(price),
                description,
                category,
                images: JSON.stringify(images), // Ensure stringified
                stock: parseInt(stock),
                sizes: JSON.stringify(sizes),
                isNew: isNew || false,
                isOnSale: isOnSale || false,
                variants: {
                    create: variants?.map(v => ({
                        size: v.size,
                        color: v.color,
                        stock: parseInt(v.stock)
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, product }, { status: 201 });
    } catch (error) {
        console.error("Admin Product POST Error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
