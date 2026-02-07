"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import styles from './HeroSlider.module.css';

export default function HeroSlider() {
    const [slides, setSlides] = useState([]);
    const [sideBanners, setSideBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const timerRef = useRef(null);

    const fetchHeroData = useCallback(async () => {
        try {
            const [heroRes, bannerRes] = await Promise.all([
                fetch('/api/admin/hero'),
                fetch('/api/admin/side-banners')
            ]);

            const heroData = await heroRes.json();
            const bannerData = await bannerRes.json();

            setSlides(Array.isArray(heroData) ? heroData : [heroData]);
            setSideBanners(Array.isArray(bannerData) ? bannerData.filter(b => b.isActive) : []);
        } catch (error) {
            console.error("Failed to fetch hero data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHeroData();
    }, [fetchHeroData]);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }, [slides.length]);

    // Auto-slide
    useEffect(() => {
        if (slides.length > 1) {
            timerRef.current = setInterval(nextSlide, 5000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [slides.length, nextSlide]);

    // Swipe handlers
    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 70) nextSlide();
        if (touchStart - touchEnd < -70) prevSlide();
    };

    if (loading) return <div className="h-[500px] flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;
    if (slides.length === 0) return null;

    return (
        <section className={styles.heroSection}>
            <div className={`container mx-auto px-4 lg:px-0 flex flex-col lg:flex-row gap-8`}>
                {/* Main Slider Area */}
                <div
                    className={`${styles.sliderContainer} flex-grow rounded-[2rem] shadow-xl`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id || index}
                            className={`${styles.slide} ${index === currentIndex ? styles.activeSlide : ''}`}
                        >
                            {/* Background Image */}
                            <div className={styles.background}>
                                {slide.backgroundImage ? (
                                    <Image
                                        src={slide.backgroundImage}
                                        alt={slide.title}
                                        fill
                                        priority={index === 0}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100" />
                                )}
                                {slide.backgroundImage && <div className={styles.overlay} />}
                            </div>

                            <div className={styles.slideContent}>
                                <div className={`${styles.contentWrapper} ${slide.backgroundImage ? styles.darkText : ''}`}>
                                    <span className={styles.label}>{slide.eyebrowText || "NEW"}</span>
                                    <h1 className={styles.title}>{slide.title}</h1>
                                    <p className={styles.subtitle}>{slide.subtitle}</p>
                                    <div className={styles.ctaWrapper}>
                                        <Link href={slide.buttonLink || '/shop'}>
                                            <Button style={{ padding: '16px 40px', fontSize: '16px' }}>
                                                {slide.buttonText || "SHOP NOW"}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    {slides.length > 1 && (
                        <>
                            <button className={`${styles.arrow} ${styles.prev}`} onClick={prevSlide} aria-label="Previous slide">
                                <ChevronLeft size={24} />
                            </button>
                            <button className={`${styles.arrow} ${styles.next}`} onClick={nextSlide} aria-label="Next slide">
                                <ChevronRight size={24} />
                            </button>

                            {/* Dot Indicators */}
                            <div className={styles.dots}>
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                                        onClick={() => setCurrentIndex(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Side Banners Section (Static, matches previous structure) */}
                {sideBanners.length > 0 && (
                    <div className="flex flex-col gap-4 w-full lg:w-[350px]">
                        {sideBanners.slice(0, 2).map((banner) => (
                            <Link key={banner.id} href={banner.link || '#'} className="block group">
                                <div className="relative h-[240px] lg:h-[calc(50%-8px)] rounded-3xl overflow-hidden shadow-lg border border-white/5 transition-all hover:shadow-2xl hover:scale-[1.01]">
                                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                                        <h3 className="text-white font-bold text-xl mb-2">{banner.title}</h3>
                                        <span className="text-teal-400 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            EXPLORE NOW <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
