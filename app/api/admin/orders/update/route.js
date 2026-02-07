import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
    try {
        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        // Update Timeline in Demo Store
        try {
            const { getOrderMeta, saveOrderMeta } = require('@/lib/demoStore');
            const meta = await getOrderMeta(orderId);
            const timeline = meta.timeline || [];

            timeline.push({
                status: status,
                timestamp: new Date().toISOString(),
                note: `Order status updated to ${status}`
            });

            await saveOrderMeta(orderId, { timeline });
        } catch (e) {
            console.error("Failed to update timeline meta", e);
        }

        return NextResponse.json({ ok: true, order: updatedOrder });
    } catch (error) {
        console.error('Order Status Update Error:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
