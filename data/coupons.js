export const defaultCoupons = [
    {
        id: "default-1",
        code: "WELCOME10",
        type: "PERCENT",
        value: 10,
        minOrder: 500,
        maxUses: 1000,
        usedCount: 0,
        active: true
    },
    {
        id: "default-2",
        code: "FLAT50",
        type: "FIXED",
        value: 50,
        minOrder: 1000,
        maxUses: 500,
        usedCount: 0,
        active: true
    },
    {
        id: "default-3",
        code: "FREESHIP",
        type: "FIXED",
        value: 70, // Assuming 70 is standard shipping
        minOrder: 2000,
        usedCount: 0,
        active: true
    }
];
