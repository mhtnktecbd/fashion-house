import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get('phone');
        const session = await getServerSession(authOptions);

        let whereClause = {};

        // 1. If logged in, prioritize user ID
        if (session?.user?.id) {
            // Assuming guestPhone is used for everyone in this project structure based on previous context 
            // but if user is linked, we might check userId field if it existed.
            // Looking at schema, Order has userId (optional).
            whereClause = { userId: session.user.id };
        }
        // 2. If guest phone provided (and not logged in or purely guest check)
        else if (phone) {
            whereClause = { guestPhone: phone };
        }
        else {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('My Orders Error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
