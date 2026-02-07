import { NextResponse } from 'next/server';
import { saveProductOverride } from '@/lib/demoStore';

export async function POST(req) {
    try {
        const body = await req.json();
        const { slug, ...data } = body;

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        await saveProductOverride(slug, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save override' }, { status: 500 });
    }
}
