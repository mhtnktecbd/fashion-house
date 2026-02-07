import { NextResponse } from 'next/server';
import { getReviews, saveReviews } from '@/lib/demoStore';

export async function GET() {
    const reviews = await getReviews();
    // Return all reviews sorted by date desc
    return NextResponse.json(reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}

export async function PATCH(request) {
    try {
        const { id, status, adminNote } = await request.json();
        const reviews = await getReviews();

        const updatedReviews = reviews.map(r =>
            r.id === id ? { ...r, status, adminNote: adminNote ?? r.adminNote } : r
        );

        await saveReviews(updatedReviews);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id } = await request.json(); // Or search params
        // Check if id is passed in body or query? Let's generic to body for simple implementation
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const reviews = await getReviews();
        const updatedReviews = reviews.filter(r => r.id !== id);

        await saveReviews(updatedReviews);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
