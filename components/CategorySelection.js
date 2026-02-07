"use client";

import { useCategories } from '@/context/CategoryContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CategorySelection.module.css';
import en from '@/lib/i18n/en';

export default function CategorySelection() {
    const { categories, isLoaded } = useCategories();

    if (!isLoaded) return null;

    let displayCategories = categories
        .filter(c => c.isActive && c.showInHome)
        .sort((a, b) => (a.sortHome || 0) - (b.sortHome || 0));

    // Fallback if DB returns empty
    if (displayCategories.length === 0) {
        displayCategories = [
            { id: 'm', nameBn: 'Men', slug: 'men', image: null },
            { id: 'w', nameBn: 'Women', slug: 'women', image: null },
            { id: 'k', nameBn: 'Kids', slug: 'kids', image: null },
            { id: 's', nameBn: 'Sports', slug: 'sports', image: null },
            { id: 'n', nameBn: 'New', slug: 'new', image: null }
        ];
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>{en.home.shopByCategory}</h2>
                    <Link href="/shop" className={styles.viewAll}>
                        {en.home.viewAll}
                    </Link>
                </div>

                <div className={styles.scrollWrapper}>
                    <div className={styles.flexContainer}>
                        {displayCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/shop/${cat.slug}`}
                                className={styles.chip}
                            >
                                <div className={styles.imageCircle}>
                                    {cat.image ? (
                                        <Image
                                            src={cat.image}
                                            alt={cat.homeLabel || cat.name || cat.nameBn}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="64px"
                                        />
                                    ) : (
                                        <div className={styles.fallback}>
                                            {(cat.homeIcon || cat.homeLabel || cat.name || cat.nameBn || '?').charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className={styles.label}>{cat.homeLabel || cat.name || cat.nameBn}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
