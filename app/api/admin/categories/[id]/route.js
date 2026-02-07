import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
    const { id } = params;
    try {
        const body = await request.json();
        // Remove undefined/null values
        const data = {};
        const fields = ['name', 'slug', 'image', 'tileImage', 'showOnHomeTiles', 'showInNavbar', 'showInHome', 'tileOrder', 'sortOrder', 'isActive', 'parentId', 'sortNavbar', 'sortHome', 'homeLabel', 'homeIcon'];

        fields.forEach(field => {
            if (body[field] !== undefined) {
                // Parse integers if needed
                if ((field === 'tileOrder' || field === 'sortOrder') && typeof body[field] !== 'number') {
                    data[field] = parseInt(body[field]);
                } else {
                    data[field] = body[field];
                }
            }
        });

        const category = await prisma.category.update({
            where: { id },
            data
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        // Check for subcategories
        const children = await prisma.category.count({
            where: { parentId: id }
        });

        if (children > 0) {
            return NextResponse.json({ error: 'Cannot delete category with subcategories. Remove subcategories first.' }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
