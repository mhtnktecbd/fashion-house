import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const categories = await prisma.category.findMany({
            where: {
                isActive: true,
                parentId: null // Only fetch root categories
            },
            include: {
                subCategories: {
                    where: { isActive: true },
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { sortOrder: 'asc' }
        });

        // Optionally, if we want product counts, we'd need a more complex query or separate aggregation.
        // For now, let's just return the tree. Implementing counts requires `subCategory` field populated in Products.
        // We can do a quick count aggregation if needed.

        // Count products per subcategory (approximate if using string matching or relation)
        // Since Product.subCategory is a string, we group by it.
        const productCounts = await prisma.product.groupBy({
            by: ['category', 'subCategory'],
            _count: {
                id: true
            }
        });

        // Map counts to the category tree
        const categoriesWithCounts = categories.map(cat => {
            const catCount = productCounts
                .filter(p => p.category === cat.name)
                .reduce((a, b) => a + b._count.id, 0);

            const subs = cat.subCategories.map(sub => {
                const subCount = productCounts
                    .find(p => p.category === cat.name && p.subCategory === sub.name)?._count.id || 0;

                return {
                    ...sub,
                    count: subCount
                };
            });

            return {
                ...cat,
                count: catCount,
                subCategories: subs
            };
        });

        return NextResponse.json({ success: true, categories: categoriesWithCounts });

    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
    }
}
