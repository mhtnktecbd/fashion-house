import { NextResponse } from 'next/server';
import { getCoupons } from '@/lib/demoStore';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');

    if (!code) {
        return NextResponse.json({ valid: false, message: "Code required" }, { status: 400 });
    }

    const coupons = await getCoupons();
    const coupon = coupons.find(c => c.code === code.toUpperCase());

    if (!coupon) {
        return NextResponse.json({ valid: false, message: "Invalid coupon code" });
    }

    if (!coupon.active) {
        return NextResponse.json({ valid: false, message: "Coupon is inactive" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ valid: false, message: "Coupon expired" });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ valid: false, message: "Coupon usage limit reached" });
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
        return NextResponse.json({
            valid: false,
            message: `Minimum order amount ৳${coupon.minOrder} required`
        });
    }

    // Calculate Discount
    let discountAmount = 0;
    if (coupon.type === 'PERCENT') {
        discountAmount = Math.round((subtotal * coupon.value) / 100);
    } else {
        discountAmount = coupon.value; // FIXED
    }

    // Clamp discount
    if (discountAmount > subtotal) discountAmount = subtotal;
    if (discountAmount < 0) discountAmount = 0;

    return NextResponse.json({
        valid: true,
        coupon: {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value
        },
        discountAmount
    });
}
