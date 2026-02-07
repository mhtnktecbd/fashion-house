import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(reviews);
    } catch (error) {
        console.error("GET Reviews Error:", error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { id, status, adminNote } = await request.json();

        await prisma.review.update({
            where: { id },
            data: { status, adminNote }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH Review Error:", error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.review.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE Review Error:", error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
