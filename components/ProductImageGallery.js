"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import styles from './ProductImageGallery.module.css';

export default function ProductImageGallery({ product }) {
    // Normalize images (Derived State)
    const images = (product.images && Array.isArray(product.images) && product.images.length > 0)
        ? product.images
        : (product.image ? [product.image] : ['/placeholder.svg']);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Reset index when product changes (Render-time check)
    const [prevId, setPrevId] = useState(product.id);
    if (product.id !== prevId) {
        setPrevId(product.id);
        setActiveIndex(0);
    }

    const handleMouseMove = (e) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.target.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    const nextImage = () => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (images.length === 0) return null;

    return (
        <div className={styles.gallery}>
            <div
                className={`${styles.mainImageWrapper} ${isZoomed ? styles.zoomed : ''}`}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <img
                    src={images[activeIndex]}
                    alt={product.title}
                    className={styles.mainImage}
                    style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%`, transform: 'scale(2)' } : {}}
                />

                {images.length > 1 && !isZoomed && (
                    <>
                        <button className={`${styles.navBtn} ${styles.prev}`} onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                            <ChevronLeft size={20} />
                        </button>
                        <button className={`${styles.navBtn} ${styles.next}`} onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                <div className={styles.zoomHint}>
                    <ZoomIn size={16} /> Hover to Zoom
                </div>
            </div>

            {images.length > 1 && (
                <div className={styles.thumbnails}>
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            className={`${styles.thumb} ${idx === activeIndex ? styles.activeThumb : ''}`}
                            onClick={() => setActiveIndex(idx)}
                        >
                            <img src={img} alt={`Thumb ${idx}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
