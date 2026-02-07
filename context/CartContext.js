"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext'; // NEW

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }
    const { openCart } = useUI(); // NEW

    // Load from LocalStorage
    useEffect(() => {
        const storedCart = localStorage.getItem('ab_cart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('ab_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // State to handle deferred cart opening (Fix for "Cannot update UIProvider while rendering CartProvider")
    const [shouldOpenCart, setShouldOpenCart] = useState(false);

    useEffect(() => {
        if (shouldOpenCart) {
            openCart();
            setShouldOpenCart(false);
        }
    }, [shouldOpenCart, openCart]);

    const addToCart = (product, openDrawer = true) => {
        // Variant Key Logic: ID:Size:Color
        // If missingSize/missingColor is true (deferred selection), these might be empty/default
        // But typically we only addToCart when resolved, except for "deferred" cases if we supported that.
        // Current plan: We enforce selection before adding.

        let safeSize = product.size;
        if (!safeSize) {
            // Default "FREE" if not specified, unless explicit fallback needed
            safeSize = "FREE";
        }

        const safeColor = product.color || "Default";
        // Key: "123:M:Red"
        const variantKey = `${product.id}:${safeSize}:${safeColor}`;

        setCart(prev => {
            // Determine Max Stock for this specific variant
            let maxStock = 9999;
            if (product.variantStock) {
                // variantStock key format: "Size:Color" e.g. "M:Red" or "M:Default"
                const stockKey = `${safeSize}:${safeColor}`;
                let vStock = product.variantStock;
                if (typeof vStock === 'string') {
                    try { vStock = JSON.parse(vStock); } catch (e) { }
                }
                if (vStock && vStock[stockKey] !== undefined) {
                    maxStock = vStock[stockKey];
                }
            } else if (product.sizeStock) {
                // Fallback Legacy
                let sStock = product.sizeStock;
                if (typeof sStock === 'string') {
                    try { sStock = JSON.parse(sStock); } catch (e) { }
                }
                if (sStock && sStock[safeSize] !== undefined) {
                    maxStock = sStock[safeSize];
                }
            }

            // Check if same variant exists
            const existing = prev.find(item => item.id === variantKey);
            const addQuantity = product.quantity || 1;

            if (existing) {
                const newTotal = existing.quantity + addQuantity;
                if (newTotal > maxStock) {
                    showToast(`Sorry, only ${maxStock} available for ${safeSize}/${safeColor}!`, 'error');
                    return prev;
                }

                if (openDrawer) setShouldOpenCart(true); // Trigger effect to open drawer
                return prev.map(item =>
                    item.id === variantKey
                        ? { ...item, quantity: newTotal }
                        : item
                );
            }

            // New Item Check
            if (addQuantity > maxStock) {
                showToast(`Sorry, only ${maxStock} available for ${safeSize}/${safeColor}!`, 'error');
                return prev;
            }

            // Add new item
            if (openDrawer) setShouldOpenCart(true); // Trigger effect to open drawer
            return [...prev, {
                ...product,
                id: variantKey,        // Main ID is now the variant key
                productId: product.id, // Keep original Product ID for reference
                size: safeSize,
                color: safeColor,
                quantity: addQuantity,
                maxStock: maxStock // Store maxStock for easier checks later
            }];
        });
    };

    const updateCartItemVariant = (oldItemId, { size, color }) => {
        setCart(prev => {
            const oldItem = prev.find(item => item.id === oldItemId);
            if (!oldItem) return prev;

            const newSize = size || oldItem.size;
            const newColor = color || oldItem.color;
            const newVariantKey = `${oldItem.productId}:${newSize}:${newColor}`;

            // Check if target variant already exists (and is not self)
            // (Self check is technically redundant if key changed, but good for safety)
            const existingTarget = prev.find(item => item.id === newVariantKey && item.id !== oldItemId);

            if (existingTarget) {
                // Merge: Add old quantity to existing, remove old item
                return prev
                    .map(item =>
                        item.id === newVariantKey
                            ? { ...item, quantity: item.quantity + oldItem.quantity }
                            : item
                    )
                    .filter(item => item.id !== oldItemId);
            } else {
                // Update: Change ID and properties
                return prev.map(item =>
                    item.id === oldItemId
                        ? {
                            ...item,
                            id: newVariantKey,
                            size: newSize,
                            color: newColor,
                            missingSize: false // Resolved
                        }
                        : item
                );
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

    // Toast Logic
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

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
            {/* Built-in Toast UI */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    background: '#000',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    fontSize: '14px',
                    fontWeight: '500',
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
