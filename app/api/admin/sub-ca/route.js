import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // console.log("API /api/admin/sub-ca: Fetching categories...");

        // Ensure default categories exist
        const defaultCategories = ['Men', 'Women', 'Teens', 'Kids', 'Sports'];

        for (let i = 0; i < defaultCategories.length; i++) {
            const name = defaultCategories[i];
            const slug = name.toLowerCase();

            // Check if exists
            const exists = await prisma.category.findFirst({
                where: { slug }
            });

            if (!exists) {
                // console.log(`API: Creating missing category: ${name}`);
                await prisma.category.create({
                    data: {
                        name,
                        slug,
                        showInNavbar: true,
                        isActive: true, // Fixed cats are active by default
                        sortNavbar: i + 1,
                        sortOrder: i + 1,
                        parentId: null
                    }
                });
            }
        }

        // Fetch all top-level categories with their subcategories
        const categories = await prisma.category.findMany({
            where: {
                parentId: null
            },
            include: {
                subCategories: {
                    orderBy: { sortOrder: 'asc' }
                }
            },
            orderBy: {
                sortOrder: 'asc'
            }
        });

        // console.log(`API: Successfully fetched ${categories.length} main categories.`);
        return NextResponse.json({ categories });
    } catch (error) {
        console.error('API Error /api/admin/sub-ca:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
