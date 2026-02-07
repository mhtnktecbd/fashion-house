"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/context/ProductContext';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import styles from './HomeCategoryTiles.module.css'; // Reusing for consistency
import Skeleton from '@/components/Skeleton'; // Add this line

export default function HomeSectionsClient() {
    const { products, isLoaded: productsLoaded } = useProducts();
    const [sections, setSections] = useState([]);
    const [sectionsLoaded, setSectionsLoaded] = useState(false);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await fetch('/api/home/sections');
                const data = await res.json();
                if (data.success) {
                    // Strict Sort
                    const sorted = data.sections.sort((a, b) => (a.order || 999) - (b.order || 999));
                    setSections(sorted);
                }
            } catch (err) {
                console.error("Error loading home sections", err);
            } finally {
                setSectionsLoaded(true);
            }
        };
        fetchSections();
    }, []);

    // Countdown Helper
    const useCountdown = (targetDate) => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    ended: false
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
        };
        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
        useEffect(() => {
            const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
            return () => clearInterval(timer);
        }, [targetDate]);
        return timeLeft;
    };

    const CategoryGrid = ({ section }) => {
        if (!section.items || section.items.length === 0) return null;

        return (
            <section style={{ padding: '60px 0', background: '#fff' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#111827' }}>{section.title}</h2>
                        {section.subtitle && <p style={{ color: '#6b7280', margin: 0 }}>{section.subtitle}</p>}
                    </div>
                    {/* 4 Col Desktop, 2 Col Mobile Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Auto fit for desktop
                        gap: '20px'
                    }} className="category-grid-container">
                        <style jsx>{`
                            @media (max-width: 768px) {
                                .category-grid-container {
                                    grid-template-columns: 1fr 1fr !important;
                                    gap: 15px !important;
                                }
                            }
                        `}</style>
                        {section.items.map((item, idx) => (
                            <Link href={`/${item.slug}`} key={idx} style={{ textDecoration: 'none', color: 'inherit', group: 'group' }} className="group">
                                <div style={{
                                    position: 'relative',
                                    aspectRatio: '3/4',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    background: '#f3f4f6'
                                }}>
                                    <img
                                        src={item.image || item.imageUrl || '/placeholder.png'}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                        className="hover:scale-105"
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        padding: '20px'
                                    }}>
                                        <div>
                                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>{item.title}</h3>
                                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                Shop Now <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {section.viewAllLink && (
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <Link href={section.viewAllLink} style={{ display: 'inline-flex', padding: '12px 24px', border: '1px solid #e5e7eb', borderRadius: '30px', fontWeight: '600', color: '#111827', textDecoration: 'none', transition: 'all 0.2s' }}>
                                View All Collections
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        );
    };

    const ProductSection = ({ section, isFlashSale }) => {
        const timeLeft = useCountdown(section.endsAt);

        if (!productsLoaded) return null;
        if (isFlashSale && section.hideWhenEnded && timeLeft.ended) return null;

        // Filter Logic (Shared)
        let displayProducts = [...products].filter(p => p.status !== 'Draft');
        if (section.mode === 'manual' && section.productSlugs?.length > 0) {
            displayProducts = displayProducts.filter(p => section.productSlugs.includes(p.slug));
        } else if (['featured', 'bestseller', 'trending', 'new'].includes(section.mode || 'newest')) {
            if (section.mode === 'featured') displayProducts = displayProducts.filter(p => p.showOnHome && p.homeGroup === 'featured');
            else if (section.mode === 'bestseller') displayProducts = displayProducts.filter(p => p.showOnHome && p.homeGroup === 'bestseller');
            else if (section.mode === 'trending') displayProducts = displayProducts.filter(p => p.showOnHome && p.homeGroup === 'trending');
            else if (section.mode === 'new') displayProducts = displayProducts.filter(p => p.showOnHome && p.homeGroup === 'new');

            displayProducts.sort((a, b) => (Number(a.homePriority) || 100) - (Number(b.homePriority) || 100));
        } else {
            // Newest
            displayProducts.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id));
        }

        if (section.limit) displayProducts = displayProducts.slice(0, section.limit);
        if (displayProducts.length === 0) return null;

        const TimeUnit = ({ val, label }) => (
            <div style={{ textAlign: 'center', minWidth: '40px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1, color: '#dc2626' }}>{String(val).padStart(2, '0')}</div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#be123c' }}>{label}</div>
            </div>
        );

        return (
            <section style={{ padding: '60px 0', background: isFlashSale ? 'linear-gradient(to bottom, #fef2f2, #fff)' : '#fff' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: '800', color: isFlashSale ? '#dc2626' : '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {isFlashSale && <Clock size={28} />} {section.title}
                                </h2>
                                {isFlashSale && !timeLeft.ended && (
                                    <div style={{ display: 'flex', gap: '8px', padding: '6px 12px', background: '#fee2e2', borderRadius: '8px', marginLeft: '10px' }}>
                                        <TimeUnit val={timeLeft.days} label="d" /> : <TimeUnit val={timeLeft.hours} label="h" /> : <TimeUnit val={timeLeft.minutes} label="m" /> : <TimeUnit val={timeLeft.seconds} label="s" />
                                    </div>
                                )}
                            </div>
                            {section.subtitle && <p style={{ color: isFlashSale ? '#ef4444' : '#6b7280', margin: '8px 0 0', fontWeight: '500' }}>{section.subtitle}</p>}
                        </div>
                        {section.viewAllLink && (
                            <Link href={section.viewAllLink} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: isFlashSale ? '#dc2626' : '#111827' }}>
                                View All <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>

                    <div className="product-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '25px'
                    }}>
                        <style jsx>{`
                            @media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                            @media (max-width: 640px) { .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 15px !important; } }
                        `}</style>
                        {displayProducts.map(product => (
                            <ProductCard key={product.id} product={{ ...product, image: product.image || product.imageUrl || '/placeholder.png' }} />
                        ))}
                    </div>
                </div>
            </section>
        );
    };

    if (!sectionsLoaded || !productsLoaded) {
        return (
            <div className="container" style={{ padding: '60px 0' }}>
                {/* Category Grid Skeleton */}
                <div style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                        <Skeleton width="200px" height="32px" style={{ marginBottom: '10px' }} />
                        <Skeleton width="300px" height="20px" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} height="350px" borderRadius="16px" />
                        ))}
                    </div>
                </div>

                {/* Product Grid Skeleton */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                        <Skeleton width="250px" height="32px" />
                        <Skeleton width="100px" height="20px" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i}>
                                <Skeleton height="300px" borderRadius="12px" style={{ marginBottom: '12px' }} />
                                <Skeleton width="80%" height="16px" style={{ marginBottom: '8px' }} />
                                <Skeleton width="40%" height="16px" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {sections
                .filter(s => s.enabled)
                .map(section => {
                    if (section.type === 'category_grid') return <CategoryGrid key={section.id} section={section} />;
                    if (section.type === 'product_grid') return <ProductSection key={section.id} section={section} isFlashSale={false} />;
                    if (section.type === 'flash_sale') return <ProductSection key={section.id} section={section} isFlashSale={true} />;
                    return null;
                })}
        </div>
    );
}
