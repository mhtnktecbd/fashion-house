"use client";

import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';
import styles from './ProductCard.module.css';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { Heart, Eye } from 'lucide-react';
import en from '@/lib/i18n/en';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { openQuickView } = useUI();
    // const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const isWishlisted = false;

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Stock Logic
    let totalStock = 999; // Default

    // Check Variant Stock
    if (product.variantStock) {
        let vStock = product.variantStock;
        if (typeof vStock === 'string') {
            try { vStock = JSON.parse(vStock); } catch (e) { }
        }
        if (vStock && Object.keys(vStock).length > 0) {
            totalStock = Object.values(vStock).reduce((a, b) => a + b, 0);
        }
    }
    // Fallback to Size Stock (Legacy)
    else if (product.sizeStock) {
        let sStock = product.sizeStock;
        if (typeof sStock === 'string') {
            try { sStock = JSON.parse(sStock); } catch (e) { }
        }
        if (sStock && Object.keys(sStock).length > 0) {
            totalStock = Object.values(sStock).reduce((a, b) => a + b, 0);
        }
    }
    // Fallback to sizes array
    else if (product.sizes) {
        // If sizes exist but no explicit stock, assume in stock
        totalStock = 100;
    }

    const isOutOfStock = totalStock === 0;
    const isLowStock = totalStock <= 3 && totalStock > 0;

    // Calculate Discount
    const discountPercent = product.originalPrice && product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        // Check if config required
        const isSizeRequired = product.sizeRequired !== false; // Default true
        const isColorRequired = product.colorRequired === true; // Default false

        // If ANY config required, Open Quick View
        if (isSizeRequired || isColorRequired) {
            openQuickView(product);
            return;
        }

        // If simple product (no size/color required), add directly
        addToCart({
            ...product,
            quantity: 1,
            size: 'FREE',
            color: 'Default'
        });
    };

    return (
        <div className={styles.card}>
            <Link href={`/product/${product.slug}`} className={styles.imageLink}>
                <div className={styles.imageWrapper}>
                    <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />

                    {/* Badges */}
                    <div className={styles.badges}>
                        {product.isNew && <span className={styles.badge}>NEW</span>}
                        {discountPercent > 0 && <span className={`${styles.badge} ${styles.sale}`}>{discountPercent}% OFF</span>}
                        {isOutOfStock && <span className={styles.badge} style={{ background: '#333', color: '#fff' }}>SOLD OUT</span>}
                        {!isOutOfStock && isLowStock && <span className={styles.badge} style={{ background: '#eab308', color: '#000' }}>LOW STOCK</span>}
                    </div>

                    {/* Quick Actions Overlay (Desktop) */}
                    <div className={styles.overlayActions}>
                        <button
                            className={`${styles.actionBtn} ${isWishlisted ? styles.activeWishlist : ''}`}
                            onClick={toggleWishlist}
                            title="Add to Wishlist"
                        >
                            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openQuickView(product);
                            }}
                            title="Quick View"
                        >
                            <Eye size={18} />
                        </button>
                    </div>

                    {/* Mobile Quick View Button (optional, can hide via CSS or keep as pill) */}
                    <button
                        className={styles.quickViewBtnMobile}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openQuickView(product);
                        }}
                    >
                        Quick View
                    </button>
                </div>
            </Link>

            <div className={styles.content}>
                <h3 className={styles.title}>
                    <Link href={`/product/${product.slug}`}>{product.title}</Link>
                </h3>

                <div className={styles.footer}>
                    <div className={styles.priceBlock}>
                        <span className={styles.price}>৳{product.price}</span>
                        {product.originalPrice && (
                            <span className={styles.originalPrice}>৳{product.originalPrice}</span>
                        )}
                    </div>

                    <Button
                        fullWidth
                        className={styles.addBtn}
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                    >
                        {isOutOfStock ? 'OUT OF STOCK' : ((product.sizeRequired !== false || product.colorRequired) ? 'Select Options' : en.product.addToCart)}
                    </Button>
                </div>
            </div>
        </div >
    );
}
