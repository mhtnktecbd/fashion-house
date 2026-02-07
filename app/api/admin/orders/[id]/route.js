import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrderMeta, saveOrderMeta } from '@/lib/demoStore';

export async function GET(req, { params }) {
    try {
        // Next.js 15+ / 16: params is a Promise
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

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Fetch order error:', error);
        return NextResponse.json({ error: 'Failed to fetch order', details: error.message }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        // Next.js 15+ / 16: params is a Promise. MUST await it.
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        console.log(`Updating order ${id} to status: ${status}`);

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({
                error: `Invalid status. Allowed: ${validStatuses.join(', ')}`
            }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status }
        });

        // --- Demo Mode: Save Timeline to File Store ---
        const meta = await getOrderMeta(id);
        const timeline = meta.timeline || [];
        timeline.push({
            status,
            timestamp: new Date().toISOString(),
            note: `Status updated to ${status} by admin`
        });
        await saveOrderMeta(id, { timeline });
        // ----------------------------------------------

        console.log('Order updated successfully:', updatedOrder.id);

        return NextResponse.json({
            success: true,
            order: updatedOrder
        });

    } catch (error) {
        console.error('Update order error details:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to update order',
            error: error.toString()
        }, { status: 500 });
    }
}
