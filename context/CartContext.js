"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useUI } from '@/context/UIContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState(null);
    const { openCart } = useUI();

    // 1. Refs for Safety & Side Effects
    const isInitialized = useRef(false);        // Prevent overwriting storage on mount
    const shouldOpenCartRef = useRef(false);    // Decouple UI side effect from render
    const cartRef = useRef(cart);               // Track latest cart for synchronous validation

    // Keep cartRef in sync (Effect runs after render)
    useEffect(() => {
        cartRef.current = cart;
    }, [cart]);

    // 2. Load from LocalStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('ab_cart');
            if (stored) {
                // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
                setCart(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to parse cart", e);
        }
    }, []);

    // 3. Save to LocalStorage & Handle Open Drawer Side Effect
    useEffect(() => {
        if (isInitialized.current) {
            localStorage.setItem('ab_cart', JSON.stringify(cart));

            // Handle Open Drawer Side Effect (Purely after render)
            if (shouldOpenCartRef.current) {
                openCart();
                shouldOpenCartRef.current = false;
            }
        } else {
            isInitialized.current = true;
        }
    }, [cart, openCart]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    /**
     * Pure Helper: Calculate New Cart State
     * Returns { success: boolean, newCart: array, message: string }
     */
    const calculateCartDelta = (currentCart, product, incrementQuantity = 0) => {
        // Variant Key Logic: ID:Size:Color
        const safeSize = product.size || "FREE";
        const safeColor = product.color || "Default";
        const variantKey = `${product.id}:${safeSize}:${safeColor}`;

        // Determine Max Stock
        let maxStock = 9999;
        if (product.variantStock) {
            const stockKey = `${safeSize}:${safeColor}`;
            let vStock = product.variantStock;
            if (typeof vStock === 'string') {
                try { vStock = JSON.parse(vStock); } catch (e) { }
            }
            if (vStock && vStock[stockKey] !== undefined) {
                maxStock = vStock[stockKey];
            }
        } else if (product.sizeStock) {
            let sStock = product.sizeStock;
            if (typeof sStock === 'string') {
                try { sStock = JSON.parse(sStock); } catch (e) { }
            }
            if (sStock && sStock[safeSize] !== undefined) {
                maxStock = sStock[safeSize];
            }
        }

        const existingItem = currentCart.find(item => item.id === variantKey);

        // Calculate Quantity to Add
        // If incrementQuantity is 0, we look at product.quantity (Add to Cart)
        // If it's passed (Update Quantity), we use it.
        const quantityToAdd = product.quantity || 1;

        if (existingItem) {
            const newTotal = existingItem.quantity + quantityToAdd;
            if (newTotal > maxStock) {
                return { success: false, newCart: currentCart, message: `Sorry, only ${maxStock} available for ${safeSize}/${safeColor}!` };
            }
            const newCart = currentCart.map(item => item.id === variantKey ? { ...item, quantity: newTotal } : item);
            return { success: true, newCart };
        }

        if (quantityToAdd > maxStock) {
            return { success: false, newCart: currentCart, message: `Sorry, only ${maxStock} available for ${safeSize}/${safeColor}!` };
        }

        const newCart = [...currentCart, {
            ...product,
            id: variantKey,
            productId: product.id,
            size: safeSize,
            color: safeColor,
            quantity: quantityToAdd,
            maxStock: maxStock
        }];
        return { success: true, newCart };
    };

    // --- Public Actions ---

    const addToCart = (product, openDrawer = true) => {
        // A. Synchronous Validation (User Feedback)
        // Uses cartRef to check against latest KNOWN state to give immediate feedback.
        const check = calculateCartDelta(cartRef.current, product);
        if (!check.success) {
            showToast(check.message, 'error');
            return;
        }

        // B. Functional State Update (Data Integrity)
        // Re-runs logic inside the setter to ensure atomic update against potentially strictly newer state
        setCart(prev => {
            const strictCheck = calculateCartDelta(prev, product);
            if (!strictCheck.success) {
                // Edge case: Race condition (e.g. double click).
                // We return 'prev' (no change). 
                // We cannot side-effect (Toast) here safely in all modes.
                // We rely on step A for the primary feedback.
                return prev;
            }
            return strictCheck.newCart;
        });

        // C. Queue Side Effect
        if (openDrawer) {
            shouldOpenCartRef.current = true;
        }
    };

    const updateCartItemVariant = (oldItemId, { size, color }) => {
        setCart(prev => {
            const oldItem = prev.find(item => item.id === oldItemId);
            if (!oldItem) return prev;

            const newSize = size || oldItem.size;
            const newColor = color || oldItem.color;
            const newVariantKey = `${oldItem.productId}:${newSize}:${newColor}`;

            const existingTarget = prev.find(item => item.id === newVariantKey && item.id !== oldItemId);

            if (existingTarget) {
                return prev
                    .map(item => item.id === newVariantKey ? { ...item, quantity: item.quantity + oldItem.quantity } : item)
                    .filter(item => item.id !== oldItemId);
            } else {
                return prev.map(item => item.id === oldItemId ? {
                    ...item,
                    id: newVariantKey,
                    size: newSize,
                    color: newColor,
                    missingSize: false
                } : item);
            }
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateCartItemVariant,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '24px', right: '24px',
                    background: '#000', color: '#fff', padding: '12px 24px',
                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999, fontSize: '14px', fontWeight: '500',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {toast.message}
                </div>
            )}
            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
