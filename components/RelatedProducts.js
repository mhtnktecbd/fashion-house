"use client";

import { useProducts } from '@/context/ProductContext';
import ProductCard from './ProductCard';
import styles from './RelatedProducts.module.css';

export default function RelatedProducts({ currentProductId, category }) {
    const { products } = useProducts();

    // Filter logic
    const related = products
        .filter(p => p.id !== currentProductId && p.category === category)
        .slice(0, 4); // Limit to 4 items

    if (!category || related.length === 0) return null;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>You May Also Like</h2>
            <div className={styles.grid}>
                {related.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
