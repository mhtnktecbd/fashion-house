import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCoupons, getProductOverrides, saveProductOverrides } from '@/lib/demoStore';

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
        const productIds = cart.map((item) => item.productId); // Use productId
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, slug: true, price: true, sizes: true, title: true } // Select slug for overrides
        });

        // Get Overrides (for Stock)
        const overrides = await getProductOverrides();

        const productMap = new Map(existingProducts.map(p => {
            // Merge with override
            const override = overrides[p.slug] || {};
            return [p.id, { ...p, ...override }];
        }));

        const validItems = [];
        const stockUpdates = {}; // slug -> { variantStock }

        for (const item of cart) {
            const product = productMap.get(item.productId);

            // Strict Mode: Filter out missing items
            if (product) {
                // --- Size Validation ---
                const hasSizes = product.sizes && product.sizes !== '[]' && product.sizes !== 'null';
                // Note: product.sizes might be array or object from override, need to parse if string
                // But generally overrides store it as array/object in memory if loaded from JSON? 
                // Wait, demoStore returns parsed JSON.

                let productSizes = product.sizes;
                if (typeof productSizes === 'string') {
                    try { productSizes = JSON.parse(productSizes); } catch (e) { }
                }
                // Convert object {S:10} to keys if needed, or check length if array
                const hasSizeList = Array.isArray(productSizes) ? productSizes.length > 0 : (productSizes && Object.keys(productSizes).length > 0);

                if (hasSizeList) {
                    if (!item.size || item.size === "FREE") {
                        if (!item.size) {
                            return NextResponse.json({ error: `Size is required for ${item.title}` }, { status: 400 });
                        }
                    }
                }

                // --- Stock Validation & Reservation ---
                // Parse variantStock
                let variantStock = {};
                if (product.variantStock) {
                    if (typeof product.variantStock === 'string') {
                        try { variantStock = JSON.parse(product.variantStock); } catch (e) { }
                    } else {
                        variantStock = product.variantStock;
                    }
                }

                // Parse sizeStock (fallback)
                let sizeStock = {};
                if (product.sizeStock) {
                    if (typeof product.sizeStock === 'string') {
                        try { sizeStock = JSON.parse(product.sizeStock); } catch (e) { }
                    } else {
                        sizeStock = product.sizeStock;
                    }
                }

                // Identify requested variant
                const requestedSize = item.size || "FREE";
                const requestedColor = item.color || "Default";

                // Check Variant Stock First
                const variantKey = `${requestedSize}:${requestedColor}`;

                // Only check strict variant stock if the map has keys
                if (Object.keys(variantStock).length > 0) {
                    const currentStock = variantStock[variantKey];
                    if (currentStock === undefined) {
                        // Variant doesn't exist? Allow or Block?
                        // If strict mode, block. But if new color added without stock, maybe 0?
                        // Let's assume 0 if undefined but other variants exist.
                        if (Object.keys(variantStock).length > 0) {
                            return NextResponse.json({ error: `Variant ${item.title} (${requestedSize} / ${requestedColor}) is unavailable.` }, { status: 400 });
                        }
                    } else if (currentStock < item.quantity) {
                        return NextResponse.json({ error: `Insufficient stock for ${item.title} (${requestedSize} / ${requestedColor}). Only ${currentStock} left.` }, { status: 400 });
                    }

                    // Reserve/Decrement
                    variantStock[variantKey] -= item.quantity;
                    // Prepare update
                    if (!stockUpdates[product.slug]) stockUpdates[product.slug] = {};
                    stockUpdates[product.slug].variantStock = variantStock;
                }
                // Fallback: Check Size Stock
                else if (sizeStock[requestedSize] !== undefined) {
                    if (sizeStock[requestedSize] < item.quantity) {
                        return NextResponse.json({ error: `Insufficient stock for ${item.title} (${requestedSize}). Only ${sizeStock[requestedSize]} left.` }, { status: 400 });
                    }
                    sizeStock[requestedSize] -= item.quantity;
                    if (!stockUpdates[product.slug]) stockUpdates[product.slug] = {};
                    stockUpdates[product.slug].sizes = sizeStock; // Legacy naming might be sizes or sizeStock? ProductForm saves 'sizes' as array and 'sizeStock' as object.
                    // Wait, ProductForm: sizeStock: JSON.stringify(sizeStock).
                    // So we update sizeStock.
                    stockUpdates[product.slug].sizeStock = sizeStock;
                }

                validItems.push({
                    ...item,
                    price: item.price,
                    productId: product.id
                });
                subtotal += (item.price * item.quantity);
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
        const shippingCost = zone === 'dhaka' ? 70 : 130;
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
            return newOrder;
        });

        // --- Commit Stock Updates ---
        // If order creation succeeded, save the decremented stock
        // Note: There is a race condition here (file-based db), but acceptable for demo.
        if (Object.keys(stockUpdates).length > 0) {
            // Re-fetch overrides to be safe? Or just apply what we have?
            // "stockUpdates" contains parsed objects. We need to stringify them for storage.
            // Wait, demoStore.js handles the file read/write.
            // saveProductOverrides expects the full object? No, we have getProductOverrides.
            // Let's modify the 'overrides' object we fetched earlier and save it back.

            for (const [slug, updates] of Object.entries(stockUpdates)) {
                if (!overrides[slug]) overrides[slug] = {};
                if (updates.variantStock) overrides[slug].variantStock = JSON.stringify(updates.variantStock);
                if (updates.sizeStock) overrides[slug].sizeStock = JSON.stringify(updates.sizeStock);
            }

            await saveProductOverrides(overrides);
        }

        console.log("Order created successfully:", order.id, order.orderNumber);

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
