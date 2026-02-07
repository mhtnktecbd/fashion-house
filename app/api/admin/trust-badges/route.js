import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const badges = await prisma.trustBadge.findMany({
            orderBy: { id: 'asc' }
        });

        // Seed default if empty?
        if (badges.length === 0) {
            const defaults = [
                { icon: 'ShieldCheck', text: '100% Authentic' },
                { icon: 'Truck', text: 'Fast Delivery' },
                { icon: 'RotateCcw', text: 'Easy Returns' },
                { icon: 'Award', text: 'Premium Quality' }
            ];
            // Just return defaults for now without seeding to avoid slow GET?
            // Or seed async?
            // Let's seed.
            const seeded = [];
            for (const d of defaults) {
                const s = await prisma.trustBadge.create({ data: d });
                seeded.push(s);
            }
            return NextResponse.json(seeded);
        }

        return NextResponse.json({ enabled: true, items: badges });
    } catch (error) {
        console.error("GET Trust Badges Error:", error);
        return NextResponse.json({ items: [] }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        // Body might be structure like { enabled: true, items: [...] } from demoStore structure
        // We only care about items for DB, assuming enabled is handled by frontend or global setting (maybe FeatureFlag?)

        const items = body.items || [];

        // Full replace logic?
        // Or update individually?
        // Simplest: Delete all and recreate (transaction), since it's a small list.

        await prisma.$transaction([
            prisma.trustBadge.deleteMany(),
            prisma.trustBadge.createMany({
                data: items.map(item => ({
                    icon: item.icon,
                    text: item.text,
                    isActive: true
                }))
            })
        ]);

        return NextResponse.json({ success: true, message: 'Trust Badges saved' });
    } catch (error) {
        console.error("POST Trust Badges Error:", error);
        return NextResponse.json({ success: false, message: 'Failed to save' }, { status: 500 });
    }
}
