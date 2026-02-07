"use client";

import { createContext, useContext } from 'react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { UIProvider } from '@/context/UIContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CategoryProvider } from '@/context/CategoryContext';
import { ProductProvider } from '@/context/ProductContext';
import QuickViewModal from '@/components/QuickViewModal';
import CartDrawer from '@/components/CartDrawer';

const FeatureContext = createContext({});

export function FeatureProvider({ children, features }) {
    return (
        <SessionProvider>
            <FeatureContext.Provider value={features}>
                <UIProvider>
                    <CategoryProvider>
                        <ProductProvider>
                            <CartProvider>
                                <WishlistProvider>
                                    {children}
                                    <QuickViewModal />
                                    <CartDrawer />
                                </WishlistProvider>
                            </CartProvider>
                        </ProductProvider>
                    </CategoryProvider>
                </UIProvider>
            </FeatureContext.Provider>
        </SessionProvider>
    );
}

export function useFeatures() {
    return useContext(FeatureContext);
}
