"use client";

import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import styles from './wishlist.module.css';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (product) => {
        addToCart({ ...product, quantity: 1 });
    };

    if (wishlist.length === 0) {
        return (
            <div className={`container ${styles.emptyContainer}`}>
                <div className={styles.emptyIcon}>
                    <ShoppingBag size={48} strokeWidth={1} />
                </div>
                <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>
                <p className={styles.emptyText}>Save items you love to buy later!</p>
                <Link href="/shop" className="btn-primary">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
            <h1 className={styles.pageTitle}>My Wishlist ({wishlist.length})</h1>

            <div className={styles.grid}>
                {wishlist.map(product => (
                    <div key={product.id} className={styles.card}>
                        <div className={styles.imageWrapper}>
                            <Link href={`/product/${product.slug}`}>
                                <Image
                                    src={product.image || '/placeholder.svg'}
                                    alt={product.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </Link>
                            <button
                                className={styles.removeBtn}
                                onClick={() => removeFromWishlist(product.id)}
                                title="Remove"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <Link href={`/product/${product.slug}`} className={styles.title}>
                                {product.title}
                            </Link>
                            <div className={styles.price}>৳{product.price}</div>

                            <button
                                className={styles.addBtn}
                                onClick={() => handleAddToCart(product)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
