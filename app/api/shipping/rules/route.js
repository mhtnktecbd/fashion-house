import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to format rule for frontend
function formatRule(rule) {
    if (!rule) return null;
    return {
        enabled: rule.enabled,
        codEnabled: rule.codEnabled,
        insideDhaka: {
            enabled: rule.insideDhakaActive,
            fee: rule.insideDhakaFee,
            freeShippingEnabled: rule.insideDhakaFree,
            freeShippingMin: rule.insideDhakaMin
        },
        outsideDhaka: {
            enabled: rule.outsideDhakaActive,
            fee: rule.outsideDhakaFee,
            freeShippingEnabled: rule.outsideDhakaFree,
            freeShippingMin: rule.outsideDhakaMin
        }
    };
}

export async function GET() {
    try {
        let rule = await prisma.shippingRule.findFirst({
            where: { name: 'default' }
        });

        if (!rule) {
            // Create default if missing
            rule = await prisma.shippingRule.create({
                data: {
                    name: 'default',
                    enabled: true,
                    codEnabled: true,
                    insideDhakaFee: 70,
                    insideDhakaActive: true,
                    insideDhakaFree: false,
                    insideDhakaMin: 0,
                    outsideDhakaFee: 130,
                    outsideDhakaActive: true,
                    outsideDhakaFree: false,
                    outsideDhakaMin: 0
                }
            });
        }

        return NextResponse.json(formatRule(rule));
    } catch (error) {
        console.error("GET Shipping Rule Error:", error);
        return NextResponse.json({ error: "Failed to fetch shipping rules" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { enabled, codEnabled, insideDhaka, outsideDhaka } = body;

        // Upsert the default rule
        const updated = await prisma.shippingRule.upsert({
            where: { name: 'default' },
            update: {
                enabled: enabled ?? true,
                codEnabled: codEnabled ?? true,

                insideDhakaFee: insideDhaka?.fee ?? 70,
                insideDhakaActive: insideDhaka?.enabled ?? true,
                insideDhakaFree: insideDhaka?.freeShippingEnabled ?? false,
                insideDhakaMin: insideDhaka?.freeShippingMin ?? 0,

                outsideDhakaFee: outsideDhaka?.fee ?? 130,
                outsideDhakaActive: outsideDhaka?.enabled ?? true,
                outsideDhakaFree: outsideDhaka?.freeShippingEnabled ?? false,
                outsideDhakaMin: outsideDhaka?.freeShippingMin ?? 0,
            },
            create: {
                name: 'default',
                enabled: enabled ?? true,
                codEnabled: codEnabled ?? true,

                insideDhakaFee: insideDhaka?.fee ?? 70,
                insideDhakaActive: insideDhaka?.enabled ?? true,
                insideDhakaFree: insideDhaka?.freeShippingEnabled ?? false,
                insideDhakaMin: insideDhaka?.freeShippingMin ?? 0,

                outsideDhakaFee: outsideDhaka?.fee ?? 130,
                outsideDhakaActive: outsideDhaka?.enabled ?? true,
                outsideDhakaFree: outsideDhaka?.freeShippingEnabled ?? false,
                outsideDhakaMin: outsideDhaka?.freeShippingMin ?? 0,
            }
        });

        return NextResponse.json({ success: true, rules: formatRule(updated) });
    } catch (error) {
        console.error("POST Shipping Rule Error:", error);
        return NextResponse.json({ error: "Failed to save rules" }, { status: 500 });
    }
}
