import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCoupons } from '@/lib/demoStore';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, phone, address, city, zone, payment, trxId, cart, total, couponCode } = body;

        // Basic Validation
        if (!name || !phone || !cart || cart.length === 0) {
            return NextResponse.json({ error: 'Name, phone, and cart items are required' }, { status: 400 });
        }

        const isDemoMode = process.env.DEMO_MODE === 'true';
        let fallbackProduct = null;
        let subtotal = 0;

        if (isDemoMode) {
            fallbackProduct = await prisma.product.findFirst();
            if (!fallbackProduct) {
                return NextResponse.json({ error: 'Demo mode requires at least one product in database.' }, { status: 400 });
            }
        }

        // Verify products exist and Calculate Subtotal Server-Side
        const productIds = cart.map((item) => item.productId);
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { variants: true } // Fetch variants for stock check
        });

        const productMap = new Map(existingProducts.map(p => [p.id, p]));
        const validItems = [];

        // Stock updates to apply later
        // Map<productId, { variantUpdates: Map<string, number>, sizeUpdates: Map<string, number>, productUpdate: number }>
        // Actually, simpler to just track what to decrement.
        // We will do decrement inside transaction.

        for (const item of cart) {
            const product = productMap.get(item.productId);

            // Strict Mode: Filter out missing items
            if (product) {
                // Parse sizes if string
                let productSizes = product.sizes;
                if (typeof productSizes === 'string') {
                    try { productSizes = JSON.parse(productSizes); } catch (e) { }
                }
                const hasSizeList = Array.isArray(productSizes) ? productSizes.length > 0 : (productSizes && Object.keys(productSizes).length > 0);

                if (hasSizeList) {
                    if (!item.size || item.size === "FREE") {
                        if (!item.size) {
                            return NextResponse.json({ error: `Size is required for ${item.title}` }, { status: 400 });
                        }
                    }
                }

                // --- Stock Validation ---
                const requestedSize = item.size || "FREE";
                const requestedColor = item.color || "Default";

                // Check Variant Stock
                const variant = product.variants.find(v =>
                    (v.size === requestedSize || (!v.size && requestedSize === "FREE")) &&
                    (v.color === requestedColor || (!v.color && requestedColor === "Default"))
                );

                if (variant) {
                    if (variant.stock < item.quantity) {
                        return NextResponse.json({ error: `Insufficient stock for ${item.title} (${requestedSize} / ${requestedColor}). Only ${variant.stock} left.` }, { status: 400 });
                    }
                } else {
                    // If no specific variant found, check main product stock
                    if (product.stock < item.quantity) {
                        return NextResponse.json({ error: `Insufficient stock for ${item.title}. Only ${product.stock} left.` }, { status: 400 });
                    }
                }

                validItems.push({
                    ...item,
                    price: product.price, // Use server price
                    productId: product.id
                });
                subtotal += (product.price * item.quantity);
            }
            // Demo Mode Fallback
            else if (isDemoMode && fallbackProduct) {
                validItems.push({ ...item, productId: fallbackProduct.id });
                subtotal += (item.price * item.quantity);
            }
        }

        if (validItems.length === 0) {
            return NextResponse.json({ error: 'Products in cart no longer exist' }, { status: 400 });
        }

        // --- Coupon Logic ---
        let discountAmount = 0;
        let couponDetails = "";

        if (couponCode) {
            const allCoupons = await getCoupons();
            const coupon = allCoupons.find(c => c.code === couponCode.toUpperCase());

            if (coupon && coupon.active) {
                const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
                const underLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
                const minMet = !coupon.minOrder || subtotal >= coupon.minOrder;

                if (notExpired && underLimit && minMet) {
                    if (coupon.type === 'PERCENT') {
                        discountAmount = Math.round((subtotal * coupon.value) / 100);
                    } else {
                        discountAmount = coupon.value;
                    }
                    if (discountAmount > subtotal) discountAmount = subtotal;
                    if (discountAmount < 0) discountAmount = 0;

                    couponDetails = ` | Coupon: ${coupon.code} (-${discountAmount}Tk)`;
                }
            }
        }

        // Calculate Final Total
        // Fetch shipping rules
        const shippingRule = await prisma.shippingRule.findFirst({ where: { name: 'default' } });
        const dhakaFee = shippingRule?.insideDhakaFee ?? 70;
        const outsideFee = shippingRule?.outsideDhakaFee ?? 130;

        const shippingCost = zone === 'dhaka' ? dhakaFee : outsideFee;
        const calculatedTotal = (subtotal - discountAmount) + shippingCost;
        const finalTotal = calculatedTotal < 0 ? 0 : calculatedTotal;

        // Create order transaction
        const order = await prisma.$transaction(async (tx) => {
            // Generate Order Number
            const lastOrder = await tx.order.findFirst({
                orderBy: { orderNumber: 'desc' },
                select: { orderNumber: true }
            });
            const nextOrderNumber = (lastOrder?.orderNumber ?? 1000) + 1;

            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: nextOrderNumber,
                    guestName: name,
                    guestPhone: phone,
                    guestAddress: `${address}, ${city} (${zone ? zone.toUpperCase() : ''})${couponDetails}`,
                    totalAmount: finalTotal,
                    paymentMethod: payment,
                    paymentStatus: (payment === 'cod') ? 'UNPAID' : 'PAID',
                    status: 'PENDING',
                    items: {
                        create: validItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            title: item.title,
                            size: item.size || "FREE",
                            color: item.color || "Default"
                        }))
                    }
                }
            });

            // Decrement Stock
            for (const item of validItems) {
                const requestedSize = item.size || "FREE";
                const requestedColor = item.color || "Default";

                // Try to find variant to decrement
                const variant = await tx.productVariant.findFirst({
                    where: {
                        productId: item.productId,
                        size: requestedSize,
                        color: requestedColor
                    }
                });

                if (variant) {
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { stock: { decrement: item.quantity } }
                    });
                } else {
                    // Decrement main product stock
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }

            return newOrder;
        });

        // console.log("Order created successfully:", order.id, order.orderNumber);

        return NextResponse.json(
            { success: true, orderId: order.id, orderNumber: order.orderNumber },
            { status: 201 }
        );

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({
            error: 'Failed to create order',
            details: error.message
        }, { status: 500 });
    }
}
