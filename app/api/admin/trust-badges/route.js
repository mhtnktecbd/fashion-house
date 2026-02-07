import { NextResponse } from 'next/server';
import { getTrustBadges, saveTrustBadges } from '@/lib/demoStore';

export async function GET() {
    const data = await getTrustBadges();
    return NextResponse.json(data);
}

export async function POST(request) {
    try {
        const body = await request.json();
        await saveTrustBadges(body);
        return NextResponse.json({ success: true, message: 'Trust Badges saved' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to save' }, { status: 500 });
    }
}
