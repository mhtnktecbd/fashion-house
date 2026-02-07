import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate stats
        const pendingCount = orders.filter(o => o.status === 'PENDING').length;
        const processingCount = orders.filter(o => o.status === 'PROCESSING').length;
        const completedCount = orders.filter(o => o.status === 'DELIVERED').length;
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        return NextResponse.json({
            orders,
            stats: {
                pending: pendingCount,
                processing: processingCount,
                completed: completedCount,
                revenue: totalRevenue
            }
        });
    } catch (error) {
        console.error('Admin Orders Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
