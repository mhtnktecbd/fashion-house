"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
// import { products as initialProducts } from '@/data/products';

const ProductContext = createContext();

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Try to get from API first (which fronts the data source)
                const res = await fetch('/api/products');
                const data = await res.json();

                if (data.success) {
                    setProducts(data.products);
                    localStorage.setItem('ab_products', JSON.stringify(data.products));
                } else {
                    // Fallback to localStorage if API fails? 
                    // Or just log error. For now, let's verify localStorage logic.
                    console.error("Failed to fetch products");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setIsLoaded(true);
            }
        };

        const savedProducts = localStorage.getItem('ab_products');
        if (savedProducts) {
            const parsed = JSON.parse(savedProducts);
            if (parsed.length > 0) {
                setProducts(parsed);
                setIsLoaded(true);
                // We can optionally background refresh from API
                fetchProducts();
            } else {
                fetchProducts();
            }
        } else {
            fetchProducts();
        }
    }, []);

    // Sync to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('ab_products', JSON.stringify(products));
        }
    }, [products, isLoaded]);

    const addProduct = (product) => {
        const newProduct = {
            ...product,
            id: Date.now().toString(),
            slug: product.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            createdAt: new Date().toISOString()
        };
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
    };

    const updateProduct = async (id, updatedData) => {
        // Optimistic UI Update
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, ...updatedData, updatedAt: new Date().toISOString() } : p
        ));

        // Persist Home Display settings to Server (Demo Store)
        if (updatedData.slug) {
            try {
                await fetch('/api/admin/products/override', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        slug: updatedData.slug,
                        showOnHome: updatedData.showOnHome,
                        homeGroup: updatedData.homeGroup,
                        homePriority: updatedData.homePriority,
                        homePriority: updatedData.homePriority,
                        returnInfo: updatedData.returnInfo, // Also persist these if needed
                        sizeChart: updatedData.sizeChart,
                        categorySlug: updatedData.categorySlug,
                        subcategorySlug: updatedData.subcategorySlug
                    })
                });
            } catch (err) {
                console.error("Failed to save product override", err);
            }
        }
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const toggleStatus = (id) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' } : p
        ));
    };

    return (
        <ProductContext.Provider value={{
            products,
            isLoaded,
            addProduct,
            updateProduct,
            deleteProduct,
            toggleStatus
        }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}
