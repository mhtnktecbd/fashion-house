import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
    const { id } = params;
    try {
        const body = await request.json();
        const { status, adminNote, rating, comment } = body;

        const updateData = {};
        if (status) updateData.status = status;
        if (adminNote !== undefined) updateData.adminNote = adminNote;
        if (rating) updateData.rating = rating;
        if (comment) updateData.comment = comment;

        const review = await prisma.review.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { error: 'Failed to update review' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        await prisma.review.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { error: 'Failed to delete review' },
            { status: 500 }
        );
    }
}
