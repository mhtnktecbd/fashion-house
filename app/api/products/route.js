import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category'); // Main category (Men, Women)
        const subCategory = searchParams.get('subCategory'); // T-Shirt, etc.
        const q = searchParams.get('q');
        const sort = searchParams.get('sort') || 'newest';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        const where = {};

        // Category Filter
        if (category && category !== 'all') {
            where.category = { equals: category }; // Case sensitive usually, but depends on DB collation
        }

        // Subcategory Filter
        if (subCategory) {
            where.subCategory = { equals: subCategory };
        }

        // Search Filter
        if (q) {
            where.OR = [
                { title: { contains: q } }, // Default SQLite is case-insensitive usually
                { description: { contains: q } }
            ];
        }

        // Sorting
        let orderBy = {};
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' };
                break;
        }

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
            }),
            prisma.product.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
    }
}
