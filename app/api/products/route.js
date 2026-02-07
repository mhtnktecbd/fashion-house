import { NextResponse } from 'next/server';
import { products } from '@/data/products';
import { getProductOverrides } from '@/lib/demoStore';

export async function GET() {
    // Mimic DB fetch
    try {
        const overrides = await getProductOverrides();

        // Merge overrides
        const mergedProducts = products.map(p => {
            if (overrides[p.slug]) {
                return { ...p, ...overrides[p.slug] };
            }
            return p;
        });

        return NextResponse.json({
            success: true,
            products: mergedProducts
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
