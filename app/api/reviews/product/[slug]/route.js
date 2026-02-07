import { NextResponse } from 'next/server';
import { getReviews } from '@/lib/demoStore';

export async function GET(request, { params }) {
    const { slug } = await params;

    try {
        const allReviews = await getReviews();

        // Filter by product and APPROVED status
        const productReviews = allReviews.filter(r => r.productSlug === slug && r.status === 'APPROVED');

        // Calculate stats
        const count = productReviews.length;
        const total = productReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        const average = count > 0 ? (total / count).toFixed(1) : 0;

        return NextResponse.json({
            success: true,
            reviews: productReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            count,
            average
        });
    } catch (error) {
        return NextResponse.json({ success: false, reviews: [], count: 0, average: 0 }, { status: 500 });
    }
}
