"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';
import styles from './Hero.module.css';

export default function Hero() {
    const [config, setConfig] = useState(null);
    const [sideBanners, setSideBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/hero').then(res => res.json()),
            fetch('/api/admin/side-banners').then(res => res.json())
        ]).then(([heroData, bannerData]) => {
            if (!heroData.error) setConfig(heroData);
            if (!bannerData.error) setSideBanners(bannerData.filter(b => b.isActive));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-[500px] flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;
    if (config && !config.isActive) return null;

    // Use dynamic data or fallbacks
    const heroTitle = config?.title || "প্রিমিয়াম ফ্যাশন কালেকশন ২০২৬";
    const heroEyebrow = config?.eyebrowText || "নতুন আগমন";
    const heroSubtitle = config?.subtitle || "আধুনিক স্টাইলে আপনার জন্য AuthenticBazar।";
    const heroBg = config?.backgroundImage;
    const heroBtnText = config?.buttonText || "এখনই কিনুন";
    const heroLink = config?.buttonLink || "/shop";

    return (
        <section className={`${styles.hero} ${heroBg ? 'relative overflow-hidden' : ''}`} style={heroBg ? { backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {heroBg && <div className="absolute inset-0 bg-black/40 z-0"></div>}

            <div className={`container ${styles.container} relative z-10 flex flex-col lg:flex-row gap-8`}>
                <div className={`${styles.content} animate-fade-in flex-grow`}>
                    <span className={styles.label}>{heroEyebrow}</span>
                    <h1 className={`${styles.title} ${heroBg ? 'text-white' : ''}`}>
                        {heroTitle}
                    </h1>
                    <p className={`${styles.subtitle} ${heroBg ? 'text-gray-200' : ''}`}>
                        {heroSubtitle}
                    </p>
                    <div className={styles.ctaWrapper}>
                        <Link href={heroLink}>
                            <Button className={styles.heroBtn} style={{ padding: '16px 36px', fontSize: '16px' }}>
                                {heroBtnText}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Side Banners Section */}
                {sideBanners.length > 0 && (
                    <div className="flex flex-col gap-4 w-full lg:w-[350px]">
                        {sideBanners.slice(0, 2).map((banner) => (
                            <Link key={banner.id} href={banner.link || '#'} className="block group">
                                <div className="relative h-[180px] rounded-2xl overflow-hidden shadow-lg border border-white/10 transition-transform group-hover:scale-[1.02]">
                                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                        <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                                        <span className="text-teal-400 text-sm font-semibold flex items-center gap-1">
                                            বিস্তারিত দেখুন →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Optional: Hero Image or Graphic (hidden if side banners present) */}
                {sideBanners.length === 0 && (
                    <div className={`${styles.visual} animate-fade-in`}>
                        <div className={styles.blob}></div>
                    </div>
                )}
            </div>
        </section>
    );
}
