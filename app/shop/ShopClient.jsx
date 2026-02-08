"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ShopSidebar from '@/components/shop/ShopSidebar';
import FilterBar from '@/components/shop/FilterBar';
import ProductCard from '@/components/ProductCard';
// import Navbar from '@/components/Navbar'; // Removed: Handled in Global Layout
// import Footer from '@/components/Footer'; // Assuming you have one

function ShopContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL Params
    const activeCategory = searchParams.get('category') || '';
    const activeSubCategory = searchParams.get('subCategory') || '';
    const initialQuery = searchParams.get('q') || '';
    const initialSort = searchParams.get('sort') || 'newest';

    // State
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Sort & Search State (Local before push)
    const [sort, setSort] = useState(initialSort);
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== initialQuery) {
                updateFilters({ q: searchQuery });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Update sort when changed
    useEffect(() => {
        if (sort !== initialSort) {
            updateFilters({ sort });
        }
    }, [sort]);

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Categories (Ideally this is static or cached, but fetching here for now)
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                if (catData.success) setCategories(catData.categories);

                // 2. Fetch Products with current filters
                const query = new URLSearchParams(searchParams);
                const prodRes = await fetch(`/api/products?${query.toString()}`);
                const prodData = await prodRes.json();
                if (prodData.success) setProducts(prodData.products);

            } catch (error) {
                console.error("Shop fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    // Filter Handler
    const updateFilters = (newParams) => {
        const currentParams = new URLSearchParams(searchParams);

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === '' || value === 'all') {
                currentParams.delete(key);
            } else {
                currentParams.set(key, value);
            }
        });

        // Reset page on filter change
        currentParams.set('page', '1');

        router.push(`/shop?${currentParams.toString()}`, { scroll: false });
    };

    const handleSelectCategory = (category, subCategory) => {
        updateFilters({
            category: category,
            subCategory: subCategory // can be null to clear
        });
        setMobileSidebarOpen(false);
    };

    const handleClearFilters = (type) => {
        if (type === 'all') {
            router.push('/shop');
            setSearchQuery('');
        } else if (type === 'category') {
            updateFilters({ category: null, subCategory: null });
        } else if (type === 'subCategory') {
            updateFilters({ subCategory: null });
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar handled globally in layout.js */}

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar */}
                    <ShopSidebar
                        categories={categories}
                        activeCategory={activeCategory}
                        activeSubCategory={activeSubCategory}
                        mobileOpen={mobileSidebarOpen}
                        setMobileOpen={setMobileSidebarOpen}
                        onSelectCategory={handleSelectCategory}
                    />

                    {/* Main Content */}
                    <main className="flex-1 w-full min-w-0">
                        <FilterBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            activeCategory={activeCategory}
                            activeSubCategory={activeSubCategory}
                            setMobileSidebarOpen={setMobileSidebarOpen}
                            totalProducts={products.length} // Should specific pagination total
                            sort={sort}
                            setSort={setSort}
                            onClearFilters={handleClearFilters}
                        />

                        {/* Product Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-gray-200 rounded-xl aspect-[4/5] mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-xl">
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters</p>
                                <button onClick={() => handleClearFilters('all')} className="mt-4 text-blue-600 font-medium hover:underline">Clear all filters</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function ShopClient() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}
