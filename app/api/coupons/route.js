import { NextResponse } from 'next/server';
import { getCoupons, saveCoupons } from '@/lib/demoStore';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const coupons = await getCoupons();
    return NextResponse.json(coupons);
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { code, type, value, minOrder, maxUses, expiresAt } = body;

        if (!code || !type || value === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const coupons = await getCoupons();
        if (coupons.some(c => c.code === code.toUpperCase())) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }

        const newCoupon = {
            id: uuidv4(),
            code: code.toUpperCase(),
            type,
            value: Number(value),
            minOrder: minOrder ? Number(minOrder) : 0,
            maxUses: maxUses ? Number(maxUses) : null,
            usedCount: 0,
            expiresAt: expiresAt || null,
            active: true
        };

        coupons.push(newCoupon);
        await saveCoupons(coupons);

        return NextResponse.json(newCoupon, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;

        let coupons = await getCoupons();
        const index = coupons.findIndex(c => c.id === id);

        if (index === -1) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        // Prevent duplicate codes if code is being updated
        if (updates.code) {
            const existing = coupons.find(c => c.code === updates.code.toUpperCase() && c.id !== id);
            if (existing) {
                return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
            }
            updates.code = updates.code.toUpperCase();
        }

        coupons[index] = { ...coupons[index], ...updates };
        await saveCoupons(coupons);

        return NextResponse.json(coupons[index]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        let coupons = await getCoupons();
        const filtered = coupons.filter(c => c.id !== id);

        if (filtered.length === coupons.length) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        await saveCoupons(filtered);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
    }
}
