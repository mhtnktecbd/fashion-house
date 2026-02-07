// import prisma from './prisma';

export const defaultFeatures = {
    guest_checkout: true,
    account_system: true,
    google_login: true,
    email_login: true,
    cod_payment: true,
    bkash_payment: true,
    nagad_payment: true,
    card_payment: true,
    quick_buy: false,
    abandoned_recovery: false,
    return_system: true,
    whatsapp_button: false,
    messenger_button: false,
    animations: true,
    wishlist: false,
    reviews: false,
    stock_notify: false,
    shipping_bar: false,
    bundle_offers: false,
    seo_auto: true,
    courier_dispatch: true,
};

export async function getFeatures() {
    return {
        ...defaultFeatures,
        google_login: defaultFeatures.google_login && !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    };
}

export async function toggleFeature(key, enabled) {
    console.log(`[MOCK] Toggling feature ${key} to ${enabled}`);
    // In a real app, logic to update DB
    defaultFeatures[key] = enabled;
    return { key, enabled };
}
