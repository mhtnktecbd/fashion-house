export const defaultShippingRules = {
    enabled: true,
    codEnabled: true,
    insideDhaka: {
        enabled: true,
        fee: 70,
        freeShipping: false,
        freeAbove: 5000
    },
    outsideDhaka: {
        enabled: true,
        fee: 130,
        freeShipping: false,
        freeAbove: 8000
    }
};
