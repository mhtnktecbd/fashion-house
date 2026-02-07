"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HomeCategoryTiles.module.css';
import { getHomeTiles, getHomeTilesConfig } from '@/lib/homeTilesStore';
import en from '@/lib/i18n/en';

export default function HomeCategoryTiles({
    title,
    subtitle,
    viewAllLink,
    items,
    enabled = true
}) {
    // Legacy support: if no items passed, use store
    const [legacyTiles, setLegacyTiles] = useState([]);
    const [legacyConfig, setLegacyConfig] = useState({ sectionEnabled: true });

    // Determine source of truth
    const isLegacy = !items;

    const [isLoaded, setIsLoaded] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        if (isLegacy) {
            setLegacyTiles(getHomeTiles());
            setLegacyConfig(getHomeTilesConfig());
        }
        setIsLoaded(true);
    }, [isLegacy]);

    useEffect(() => {
        if (!isLoaded) return;
        // If legacy and disabled, don't observe
        if (isLegacy && !legacyConfig.sectionEnabled) return;
        // If props mode and disabled, we shouldn't even render, but just in case
        if (!isLegacy && !enabled) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.cardVisible);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const cards = document.querySelectorAll(`.${styles.card}`);
        cards.forEach(card => observer.observe(card));

        return () => observer.disconnect();
    }, [isLoaded, enabled, items, legacyTiles, legacyConfig]);

    if (!isLoaded) return null;

    // Decide what to render
    let activeTiles = [];
    let sectionTitle = title;
    let sectionSubtitle = subtitle;
    let sectionLink = viewAllLink;
    let sectionEnabled = enabled;

    if (isLegacy) {
        if (!legacyConfig.sectionEnabled) return null;
        activeTiles = legacyTiles.filter(t => t.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
        sectionTitle = en.category.all || "Style Categories";
        sectionSubtitle = en.home?.shopByCategory || "Choose your favorite look";
        sectionLink = "/shop";

        // Fallback for legacy
        if (activeTiles.length === 0) {
            activeTiles = [
                { id: 'men', title: en.nav.men, slug: 'men', imageUrl: '', isEnabled: true },
                { id: 'women', title: en.nav.women, slug: 'women', imageUrl: '', isEnabled: true },
                { id: 'kids', title: en.nav.kids, slug: 'kids', imageUrl: '', isEnabled: true }
            ];
        }
    } else {
        if (!enabled) return null;
        activeTiles = items || [];
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <h2 className={styles.title}>{sectionTitle}</h2>
                        <span className={styles.subtitle}>{sectionSubtitle}</span>
                    </div>
                    {sectionLink && (
                        <Link href={sectionLink} className={styles.viewAll}>
                            {en.home?.viewAll || "View All"} →
                        </Link>
                    )}
                </div>

                <div className={styles.grid}>
                    {activeTiles.map((tile, index) => (
                        <Link
                            key={tile.id || tile.slug || index}
                            href={`/shop/${tile.slug}`}
                            className={styles.card}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className={styles.imageWrapper}>
                                {tile.image || tile.imageUrl ? (
                                    <Image
                                        src={tile.image || tile.imageUrl}
                                        alt={tile.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                                        style={{ objectFit: 'cover' }}
                                        priority={index < 2}
                                    />
                                ) : (
                                    <div className={styles.placeholder}>
                                        {tile.title}
                                    </div>
                                )}
                            </div>
                            <div className={styles.overlay}>
                                <span className={styles.label}>{tile.title}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
