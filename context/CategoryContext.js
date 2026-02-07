"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setCategories(data.categories);
                }
            }
        } catch (error) {
            console.error("Failed to fetch categories");
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Helper to refresh data (called by Admin)
    const refreshCategories = () => fetchCategories();

    return (
        <CategoryContext.Provider value={{
            categories, // These are nested now
            isLoaded,
            refreshCategories
        }}>
            {children}
        </CategoryContext.Provider>
    );
}

export function useCategories() {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
}

