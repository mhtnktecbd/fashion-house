import { NextResponse } from 'next/server';
import { getHomeSections, saveHomeSections } from '@/lib/demoStore';
import { homeSections as defaultSections } from '@/data/homeSections';

export async function GET() {
    let sections = await getHomeSections();

    // Fallback to default if empty
    if (!sections || sections.length === 0) {
        sections = defaultSections;
    }

    return NextResponse.json({
        success: true,
        sections: sections
    });
}

export async function POST(req) {
    try {
        const sections = await req.json();
        await saveHomeSections(sections);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
