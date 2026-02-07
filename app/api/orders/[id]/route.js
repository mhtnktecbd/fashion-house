import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrderMeta } from '@/lib/demoStore';

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch meta (timeline)
        const meta = await getOrderMeta(order.id);
        const timeline = meta.timeline || [];

        // Ensure "Placed" event exists at the start
        const fullTimeline = [
            {
                status: 'PLACED',
                timestamp: order.createdAt,
                note: 'Order placed successfully'
            },
            ...timeline
        ];

        return NextResponse.json({ success: true, order, timeline: fullTimeline });
    } catch (error) {
        console.error('Fetch order error:', error);
        return NextResponse.json({ error: 'Failed to fetch order', details: error.message }, { status: 500 });
    }
}
