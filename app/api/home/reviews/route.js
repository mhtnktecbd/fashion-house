import { NextResponse } from "next/server";
import { readStore } from "@/lib/demoStore";

export async function GET() {
    try {
        const store = await readStore();

        return NextResponse.json({
            success: true,
            reviews: store?.reviews || [],
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, reviews: [] },
            { status: 200 }
        );
    }
}
