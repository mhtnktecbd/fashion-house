import { NextResponse } from 'next/server';
import { addReview } from '@/lib/demoStore';

export async function POST(request) {
    try {
        const body = await request.json();

        // Basic Validation
        if (!body.productSlug || !body.rating || !body.name || !body.comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newReview = await addReview({
            productSlug: body.productSlug,
            rating: body.rating,
            name: body.name,
            email: body.email || '',
            title: body.title || '',
            comment: body.comment
        });

        return NextResponse.json({ success: true, review: newReview });
    } catch (error) {
        console.error("Review submit error", error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
