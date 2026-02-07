import fs from 'fs/promises';
import path from 'path';
import { defaultCoupons } from '@/data/coupons';

const STORE_FILE = path.join(process.cwd(), 'data', 'demoStore.json');

// Ensure data dir exists
async function ensureDir() {
    const dir = path.dirname(STORE_FILE);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

export async function readStore() {
    try {
        await ensureDir();
        const data = await fs.readFile(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return {
            coupons: parsed.coupons || [...defaultCoupons],
            shippingRules: parsed.shippingRules || {
                enabled: true,
                codEnabled: true,
                insideDhaka: { enabled: true, fee: 70, freeShippingEnabled: false, freeShippingMin: 0 },
                outsideDhaka: { enabled: true, fee: 130, freeShippingEnabled: false, freeShippingMin: 0 }
            },
            orderMeta: parsed.orderMeta || {},
            homeSections: parsed.homeSections || [],
            productOverrides: parsed.productOverrides || {},
            heroTrustRowEnabled: parsed.heroTrustRowEnabled ?? true,
            homeReviewsEnabled: parsed.homeReviewsEnabled ?? true,
            sizeGuide: parsed.sizeGuide || {
                enabled: true,
                title: "Size Guide",
                content: "## Standard Sizing\n\n| Size | Chest | Waist |\n|------|-------|-------|\n| S    | 34-36 | 28-30 |\n| M    | 38-40 | 32-34 |\n| L    | 42-44 | 36-38 |",
                imageUrl: ""
            },
            trustBadges: parsed.trustBadges || {
                enabled: true,
                items: [
                    { id: 1, icon: 'ShieldCheck', text: '100% Authentic' },
                    { id: 2, icon: 'Truck', text: 'Fast Delivery' },
                    { id: 3, icon: 'RotateCcw', text: 'Easy Returns' },
                    { id: 4, icon: 'Award', text: 'Premium Quality' }
                ]
            },
            reviews: parsed.reviews || []
        };
    } catch (error) {
        // Return default seeded data if file missing or parse error
        return {
            coupons: [...defaultCoupons],
            shippingRules: {
                enabled: true,
                codEnabled: true,
                insideDhaka: { enabled: true, fee: 70, freeShippingEnabled: false, freeShippingMin: 0 },
                outsideDhaka: { enabled: true, fee: 130, freeShippingEnabled: false, freeShippingMin: 0 }
            },
            orderMeta: {},
            homeSections: [],
            productOverrides: {},
            heroTrustRowEnabled: true,
            homeReviewsEnabled: true,
            sizeGuide: {
                enabled: true,
                title: "Size Guide",
                content: "## Standard Sizing\n\n| Size | Chest | Waist |\n|------|-------|-------|\n| S    | 34-36 | 28-30 |\n| M    | 38-40 | 32-34 |\n| L    | 42-44 | 36-38 |",
                imageUrl: ""
            },
            trustBadges: {
                enabled: true,
                items: [
                    { id: 1, icon: 'ShieldCheck', text: '100% Authentic' },
                    { id: 2, icon: 'Truck', text: 'Fast Delivery' },
                    { id: 3, icon: 'RotateCcw', text: 'Easy Returns' },
                    { id: 4, icon: 'Award', text: 'Premium Quality' }
                ]
            },
            reviews: []
        };
    }
}

export async function writeStore(data) {
    try {
        await ensureDir();
        await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error("Failed to write demo store:", error);
        return false;
    }
}

export async function getCoupons() {
    const store = await readStore();
    return store.coupons;
}

export async function saveCoupons(coupons) {
    const store = await readStore();
    store.coupons = coupons;
    return await writeStore(store);
}

export async function getShippingRules() {
    const store = await readStore();
    return store.shippingRules;
}

export async function saveShippingRules(data) {
    const store = await readStore();
    store.shippingRules = data;
    return await writeStore(store);
}

export async function getOrderMeta(orderId) {
    const store = await readStore();
    return store.orderMeta?.[orderId] || {};
}

export async function saveOrderMeta(orderId, meta) {
    const store = await readStore();
    store.orderMeta = store.orderMeta || {};
    store.orderMeta[orderId] = { ...(store.orderMeta[orderId] || {}), ...meta };
    return await writeStore(store);
}

// Helper to normalize and sort sections
function normalizeSections(sections) {
    if (!sections || sections.length === 0) return [];

    // Sort by order
    const sorted = [...sections].sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999;
        const orderB = typeof b.order === 'number' ? b.order : 9999;
        return orderA - orderB;
    });

    // Re-index with 10, 20, 30...
    return sorted.map((s, idx) => ({
        ...s,
        order: (idx + 1) * 10
    }));
}

export async function getHomeSections() {
    const store = await readStore();
    let sections = store.homeSections || [];

    // SEED DEFAULTS IF EMPTY
    if (sections.length === 0) {
        sections = [
            {
                id: 'sec_collections',
                type: 'category_grid',
                title: 'All Collections',
                subtitle: 'Explore our latest fashion categories',
                enabled: true,
                order: 10,
                viewAllLink: '/shop',
                items: [
                    { id: '1', title: 'Men', slug: 'men', image: '/images/cat_men.jpg' },
                    { id: '2', title: 'Women', slug: 'women', image: '/images/cat_women.jpg' },
                    { id: '3', title: 'Kids', slug: 'kids', image: '/images/cat_kids.jpg' },
                    { id: '4', title: 'Sports', slug: 'sports', image: '/images/cat_sports.jpg' }
                ]
            },
            {
                id: 'sec_new_arrivals',
                type: 'product_grid',
                title: 'New Arrivals',
                subtitle: 'Fresh looks just for you',
                enabled: true,
                order: 20,
                viewAllLink: '/shop?sort=newest',
                mode: 'newest',
                limit: 8
            },
            {
                id: 'sec_flash_sale',
                type: 'flash_sale',
                title: 'Flash Sale',
                subtitle: 'Limited time offers',
                enabled: true,
                order: 30,
                endsAt: new Date(Date.now() + 86400000).toISOString(), // 24h from now
                hideWhenEnded: true,
                mode: 'featured',
                limit: 4
            }
        ];
        // Save these defaults immediately so they persist
        store.homeSections = sections;
        await writeStore(store);
    }

    // Always normalize before returning to ensure stability
    return normalizeSections(sections);
}

export async function saveHomeSections(sections) {
    const store = await readStore();
    store.homeSections = normalizeSections(sections);
    return await writeStore(store);
}

export async function getProductOverrides() {
    const store = await readStore();
    return store.productOverrides || {};
}

export async function saveProductOverrides(overrides) {
    const store = await readStore();
    store.productOverrides = overrides;
    return await writeStore(store);
}

// ... existing code ...

export async function saveProductOverride(slug, data) {
    const store = await readStore();
    store.productOverrides = store.productOverrides || {};
    store.productOverrides[slug] = { ...(store.productOverrides[slug] || {}), ...data };
    return await writeStore(store);
}

export async function getSizeGuide() {
    const store = await readStore();
    return store.sizeGuide || {
        enabled: true,
        title: "Size Guide",
        content: "## Standard Sizing\n\n| Size | Chest | Waist |\n|------|-------|-------|\n| S    | 34-36 | 28-30 |\n| M    | 38-40 | 32-34 |\n| L    | 42-44 | 36-38 |",
        imageUrl: ""
    };
}

export async function saveSizeGuide(data) {
    const store = await readStore();
    store.sizeGuide = data;
    return await writeStore(store);
}

export async function getTrustBadges() {
    const store = await readStore();
    return store.trustBadges || {
        enabled: true,
        items: [
            { id: 1, icon: 'ShieldCheck', text: '100% Authentic' },
            { id: 2, icon: 'Truck', text: 'Fast Delivery' },
            { id: 3, icon: 'RotateCcw', text: 'Easy Returns' },
            { id: 4, icon: 'Award', text: 'Premium Quality' }
        ]
    };
}

export async function saveTrustBadges(data) {
    const store = await readStore();
    store.trustBadges = data;
    return await writeStore(store);
}

export async function getReviews() {
    const store = await readStore();
    return store.reviews || [];
}

export async function saveReviews(reviews) {
    const store = await readStore();
    store.reviews = reviews;
    return await writeStore(store);
}

export async function addReview(review) {
    const reviews = await getReviews();
    const newReview = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'PENDING', // Default to pending moderation
        ...review
    };
    await saveReviews([...reviews, newReview]);
    return newReview;
}
