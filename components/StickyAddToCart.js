"use client";

import { useEffect, useState } from 'react';
import styles from './StickyAddToCart.module.css';

export default function StickyAddToCart({ product, selectedSize, onAddToCart, valid, price }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 600px (past main image/info)
            if (window.scrollY > 600) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!visible) return null;

    return (
        <div className={styles.bar}>
            <div className={styles.info}>
                <img src={product.image} alt={product.title} className={styles.thumb} />
                <div className={styles.details}>
                    <div className={styles.title}>{product.title}</div>
                    <div className={styles.price}>৳{product.price}</div>
                </div>
            </div>
            <button
                className={styles.btn}
                onClick={onAddToCart}
                disabled={!valid && selectedSize} // If user selected size but it's OOS? No, valid handles availability provided by parent
            >
                {valid ? 'ADD TO CART' : 'SELECT SIZE'}
            </button>
        </div>
    );
}
