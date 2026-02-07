"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroSlides, getHeroConfig } from '@/lib/heroStore';
import styles from './HeroCarousel.module.css';

import TrustBadgeRow from './TrustBadgeRow';

export default function HeroCarousel() {
    const [slides, setSlides] = useState([]);
    const [config, setConfig] = useState({ carouselEnabled: true, autoplaySpeed: 5000 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isReducedMotion, setIsReducedMotion] = useState(false);
    const [trustEnabled, setTrustEnabled] = useState(true);

    // Timer refs
    const autoplayTimerRef = useRef(null);
    const containerRef = useRef(null);

    // Initial load
    useEffect(() => {
        // Fetch config from server for reliable Admin control
        Promise.all([
            fetch('/api/admin/hero').then(res => res.json()).catch(() => []),
            fetch('/api/home/sections').then(res => res.json()).catch(() => ({})) // repurposing this or checking logic
        ]).then(([heroData, homeData]) => {
            // Because heroStore is client-side mock mostly, we rely on what we have or fallback
            // But let's stick to getHeroSlides for slides content if API returns default
            // If API returns valid heroes that are NOT the fallback 'default', use them.
            if (heroData && heroData.length > 0 && heroData[0].id !== 'default') {
                // Map API data to slides format if needed, or if structure matches
                // Note: API returns array of banners.
                setSlides(heroData.filter(h => h.isActive));
            } else {
                setSlides(getHeroSlides().filter(s => s.isEnabled).sort((a, b) => a.order - b.order));
            }

            // Check Trust Row status (hacky way via an API or just assume default for now as we added it to demoStore but no endpoint returns it neatly yet)
            // Ideally we'd have /api/settings. For now, default TRUE.
            setTrustEnabled(true);

            setConfig(getHeroConfig());
            setIsLoaded(true);
        });

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setIsReducedMotion(mediaQuery.matches);
    }, []);

    const nextSlide = useCallback(() => {
        if (slides.length <= 1) return;
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        if (slides.length <= 1) return;
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }, [slides.length]);

    useEffect(() => {
        if (!isLoaded || !config.carouselEnabled || slides.length <= 1 || isHovered || isReducedMotion) {
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
            return;
        }

        autoplayTimerRef.current = setInterval(nextSlide, config.autoplaySpeed || 5500);
        return () => clearInterval(autoplayTimerRef.current);
    }, [isLoaded, config.carouselEnabled, slides.length, isHovered, isReducedMotion, nextSlide, config.autoplaySpeed]);

    if (!isLoaded || !config.carouselEnabled || slides.length === 0) return null;

    return (
        <>
            <section
                ref={containerRef}
                className={styles.heroSection}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={styles.carouselContainer}>
                    {slides.map((slide, index) => {
                        const isActive = index === currentIndex;

                        return (
                            <div
                                key={slide.id || index}
                                className={`${styles.slide} ${isActive ? styles.activeSlide : ''}`}
                                aria-hidden={!isActive}
                            >
                                <div className={styles.imageContainer}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={slide.imageSrc || slide.backgroundImage || "/placeholder.svg"}
                                            alt={slide.titleBn || slide.title || "Hero Banner"}
                                            fill
                                            priority={index === 0}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            style={{
                                                objectFit: "cover",
                                                objectPosition: "center"
                                            }}
                                            sizes="100vw"
                                        />
                                    </div>
                                </div>

                                <div className={styles.overlay}></div>

                                <div className={styles.content}>
                                    <div className={styles.glassWrapper}>
                                        <span className={styles.eyebrow}>{slide.eyebrowText}</span>
                                        <h1 className={styles.title}>{slide.titleBn || slide.title}</h1>
                                        <p className={styles.subtitle}>{slide.subtitle}</p>
                                        <div className={styles.cta}>
                                            <Link href={slide.buttonLink || '/shop'} className={styles.heroBtn}>
                                                {slide.buttonText || "Shop Now"}
                                            </Link>
                                            <Link href="/shop" className={styles.secondaryBtn}>
                                                Explore Collection
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Arrow Controls */}
                    {slides.length > 1 && (
                        <>
                            <button className={`${styles.navBtn} ${styles.prev}`} onClick={prevSlide}>
                                <ChevronLeft size={24} />
                            </button>
                            <button className={`${styles.navBtn} ${styles.next}`} onClick={nextSlide}>
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Dots */}
                    {slides.length > 1 && (
                        <div className={styles.dots}>
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                                    onClick={() => setCurrentIndex(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Trust Row - Integrated directly below Hero */}
            {trustEnabled && <TrustBadgeRow />}
        </>
    );
}
