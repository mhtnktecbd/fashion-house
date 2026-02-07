"use client";

import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
    // Cart Drawer State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen(prev => !prev);

    // Quick View State
    const [quickViewProduct, setQuickViewProduct] = useState(null); // null = closed, product obj = open
    const openQuickView = (product) => setQuickViewProduct(product);
    const closeQuickView = () => setQuickViewProduct(null);

    // Filter/Mobile Menu State (if needed globally)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <UIContext.Provider value={{
            isCartOpen,
            openCart,
            closeCart,
            toggleCart,
            quickViewProduct,
            openQuickView,
            closeQuickView,
            isMobileMenuOpen,
            setIsMobileMenuOpen
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}
