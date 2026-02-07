import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { homeSections as defaultSectionsTemplate } from '@/data/homeSections';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sections = await prisma.homeSection.findMany({
            orderBy: { order: 'asc' }
        });

        // Seed if empty
        if (sections.length === 0) {
            // Transform default template to DB model?
            // Template structure: { id, type, title, subtitle, enabled, order, ... items: [] }
            // We need to loop and create.

            // Note: defaultSectionsTemplate is an array.

            const seeded = [];
            for (const s of defaultSectionsTemplate) {
                const created = await prisma.homeSection.create({
                    data: {
                        type: s.type,
                        title: s.title,
                        subtitle: s.subtitle,
                        enabled: s.enabled !== false,
                        order: s.order || 0,
                        viewAllLink: s.viewAllLink,
                        mode: s.mode,
                        limit: s.limit,
                        items: JSON.stringify(s.items || [])
                    }
                });
                seeded.push(created);
            }
            // Parse items back
            const parsed = seeded.map(s => ({
                ...s,
                items: s.items ? JSON.parse(s.items) : []
            }));
            return NextResponse.json({ success: true, sections: parsed });
        }

        const parsed = sections.map(s => ({
            ...s,
            items: s.items ? JSON.parse(s.items) : []
        }));

        return NextResponse.json({
            success: true,
            sections: parsed
        });
    } catch (error) {
        console.error("GET Home Sections Error:", error);
        return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const sections = await req.json();

        // Full update/upsert?
        // Strategy: iterate and upsert if ID looks like UUID, or deleteMany and recreate?
        // DeleteMany is safer for reordering/removing.

        await prisma.$transaction(async (tx) => {
            await tx.homeSection.deleteMany();
            for (const s of sections) {
                await tx.homeSection.create({
                    data: {
                        type: s.type,
                        title: s.title,
                        subtitle: s.subtitle,
                        enabled: s.enabled,
                        order: s.order,
                        viewAllLink: s.viewAllLink,
                        mode: s.mode,
                        limit: s.limit,
                        endsAt: s.endsAt,
                        hideWhenEnded: s.hideWhenEnded,
                        items: JSON.stringify(s.items || [])
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST Home Sections Error:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
