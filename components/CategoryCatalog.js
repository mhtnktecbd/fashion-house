"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { useProducts } from '@/context/ProductContext';
import styles from './CategoryCatalog.module.css';
import en from '@/lib/i18n/en';

// CategoryCatalogContent now relies on fresh mounting for new query params
function CategoryCatalogContent({ category }) {
    const { products, isLoaded } = useProducts();
    const searchParams = useSearchParams();
    const urlQuery = searchParams.get('q');

    const [sortBy, setSortBy] = useState('newest');
    const [maxPrice, setMaxPrice] = useState(10000);
    // Initialized solely from prop/URL on mount
    const [searchQuery, setSearchQuery] = useState(urlQuery || '');

    const filteredProducts = useMemo(() => {
        if (!isLoaded) return [];
        let items = category
            ? products.filter(p => p.category.toLowerCase() === category.toLowerCase())
            : products;

        // Show only published products on storefront
        items = items.filter(p => p.status !== 'Draft');

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(p => p.title.toLowerCase().includes(q));
        }

        items = items.filter(p => p.price <= maxPrice);

        if (sortBy === 'price-low') {
            items.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            items.sort((a, b) => b.price - a.price);
        } else {
            // Default newest (mock using ID or just as is)
            items.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        }

        return items;
    }, [category, searchQuery, maxPrice, sortBy, products, isLoaded]);

    const bgMap = {
        'Men': en.category.men,
        'Women': en.category.women,
        'Kids': en.category.kids
    };

    if (!isLoaded) {
        return (
            <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <p>{en.common?.loading || "Loading..."}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div className={styles.header}>
                <h1 className={styles.title}>{category ? (bgMap[category] || category) : en.category.all}</h1>
                <p className={styles.count}>{filteredProducts.length} {en.category.found}</p>
            </div>

            <div className={styles.layout}>
                {/* Sidebar Filters */}
                <aside className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label>{en.nav.search}</label>
                        <input
                            type="text"
                            placeholder={en.category.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label>{en.category.maxPrice}: ৳{maxPrice}</label>
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className={styles.range}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label>{en.category.sortBy}</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={styles.select}
                        >
                            <option value="newest">{en.category.newest}</option>
                            <option value="price-low">{en.category.priceLow}</option>
                            <option value="price-high">{en.category.priceHigh}</option>
                        </select>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className={styles.gridWrapper}>
                    {filteredProducts.length > 0 ? (
                        <div className="product-grid">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <p>{en.category.noProducts}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CategoryCatalog(props) {
    const searchParams = useSearchParams();
    const q = searchParams.get('q');

    return (
        <Suspense fallback={<div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>Loading...</div>}>
            <CategoryCatalogContent {...props} key={q} />
        </Suspense>
    );
}
