import { NextResponse } from 'next/server';
import { getSizeGuide, saveSizeGuide } from '@/lib/demoStore';

export async function GET() {
    const data = await getSizeGuide();
    return NextResponse.json(data);
}

export async function POST(request) {
    try {
        const body = await request.json();
        await saveSizeGuide(body);
        return NextResponse.json({ success: true, message: 'Size Guide saved' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to save' }, { status: 500 });
    }
}
