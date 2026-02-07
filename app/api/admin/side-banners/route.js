import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const banners = await prisma.sideBanner.findMany({
            orderBy: [
                { order: 'asc' },
                { createdAt: 'asc' }
            ]
        });
        return NextResponse.json(banners);
    } catch (error) {
        console.error('Error fetching side banners:', error);
        return NextResponse.json([], { status: 200 }); // Return empty array instead of 500
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const banner = await prisma.sideBanner.create({
            data: {
                ...body,
                order: body.order ? parseInt(body.order) : 0
            }
        });
        return NextResponse.json(banner);
    } catch (error) {
        console.error('Error creating banner:', error);
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const banner = await prisma.sideBanner.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                order: data.order !== undefined ? parseInt(data.order) : undefined
            }
        });
        return NextResponse.json(banner);
    } catch (error) {
        console.error('Error updating banner:', error);
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.sideBanner.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting banner:', error);
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
    }
}
