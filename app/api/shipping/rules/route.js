import { NextResponse } from 'next/server';
import { getShippingRules, saveShippingRules } from '@/lib/demoStore';

export async function GET() {
    const rules = await getShippingRules();
    return NextResponse.json(rules);
}

export async function POST(req) {
    try {
        const body = await req.json();
        const rules = body;

        // Basic validation could go here

        await saveShippingRules(rules);
        return NextResponse.json({ success: true, rules });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save rules" }, { status: 500 });
    }
}
