import { NextResponse } from 'next/server';
import { defaultFeatures, toggleFeature } from '@/lib/features';

export async function GET() {
    return NextResponse.json(defaultFeatures);
}

export async function POST(req) {
    const body = await req.json();
    const { key, enabled } = body;

    // Update mock
    defaultFeatures[key] = enabled;

    return NextResponse.json({ success: true, features: defaultFeatures });
}
