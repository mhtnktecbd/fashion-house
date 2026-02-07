import { NextResponse } from "next/server";
import { getShippingRules, saveShippingRules } from "@/lib/demoStore";

export async function GET() {
  const rules = await getShippingRules();
  return NextResponse.json(rules);
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Basic validation: ensure fee is number, not negative
    if (body.insideDhaka) body.insideDhaka.fee = Math.max(0, Number(body.insideDhaka.fee));
    if (body.outsideDhaka) body.outsideDhaka.fee = Math.max(0, Number(body.outsideDhaka.fee));

    await saveShippingRules(body);
    return NextResponse.json({ success: true, rules: body });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
