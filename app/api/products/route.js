import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const limit = searchParams.get('limit');
        const featured = searchParams.get('featured');

        const where = {};
        if (category) {
            where.category = category;
        }
        // Example: if featured is requested (though schema might not have 'featured' flag directly, maybe 'isBestSeller'?)
        // if (featured === 'true') where.isBestSeller = true;

        const products = await prisma.product.findMany({
            where,
            take: limit ? parseInt(limit) : undefined,
            include: { variants: true },
            orderBy: { createdAt: 'desc' }
        });

        // Ensure images and sizes are parsed if they are strings (Prisma returns them as strings if mapped so, but schema says String. JSON.parse needed if client expects objects)
        // Actually, client likely expects them as arrays/objects.
        // Prisma `String` fields are returned as strings.
        // We should parse them for the frontend if the frontend expects arrays.

        const parsedProducts = products.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
            sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
            // variants are already objects
        }));

        return NextResponse.json({
            success: true,
            products: parsedProducts
        });
    } catch (error) {
        console.error("Products API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
