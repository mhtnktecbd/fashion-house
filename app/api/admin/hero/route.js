import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const heroes = await prisma.heroBanner.findMany({
            where: { isActive: true },
            orderBy: { id: 'asc' }
        });

        if (!heroes || heroes.length === 0) {
            // Return a safe default array instead of crashing
            return NextResponse.json([{
                id: 'default',
                isActive: true,
                eyebrowText: 'নতুন আগমন',
                title: 'প্রিমিয়াম ফ্যাশন কালেকশন ২০২৬',
                subtitle: 'আধুনিক স্টাইলে আপনার জন্য AuthenticBazar।',
                backgroundImage: '',
                buttonText: 'এখনই কিনুন',
                buttonLink: '/shop'
            }]);
        }

        return NextResponse.json(heroes);
    } catch (error) {
        console.error('Error fetching hero:', error);
        return NextResponse.json([{
            id: 'fallback',
            isActive: true,
            eyebrowText: 'নতুন আগমন',
            title: 'প্রিমিয়াম ফ্যাশন কালেকশন ২০২৬',
            subtitle: 'আধুনিক স্টাইলে আপনার জন্য AuthenticBazar।',
            backgroundImage: '',
            buttonText: 'এখনই কিনুন',
            buttonLink: '/shop',
            _error: 'Database table entry error'
        }]);
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, ...data } = body;

        let banner;
        if (id) {
            banner = await prisma.heroBanner.update({
                where: { id: parseInt(id) },
                data
            });
        } else {
            banner = await prisma.heroBanner.create({
                data
            });
        }

        return NextResponse.json(banner);
    } catch (error) {
        console.error('Error saving hero banner:', error);
        return NextResponse.json({ error: 'Failed to save hero banner', details: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.heroBanner.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting hero banner:', error);
        return NextResponse.json({ error: 'Failed to delete hero banner' }, { status: 500 });
    }
}
