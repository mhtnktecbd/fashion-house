"use client";

import { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import styles from './ReviewsCarousel.module.css';

export default function ReviewsCarousel() {
    const [reviews, setReviews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/home/reviews');
                const data = await res.json();
                if (data.success) {
                    setReviews(data.reviews);
                }
            } catch (err) {
                console.error("Failed to load home reviews", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading || reviews.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [reviews.length]);

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.heading}>Happy Customers</h2>
                    <div className={styles.controls}>
                        <button onClick={prevSlide} className={styles.controlBtn} aria-label="Previous review">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextSlide} className={styles.controlBtn} aria-label="Next review">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className={styles.carousel}>
                    <div
                        className={styles.track}
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {reviews.map((review, idx) => (
                            <div key={idx} className={styles.slide}>
                                <div className={styles.card}>
                                    <Quote size={32} className={styles.quoteIcon} />
                                    <div className={styles.rating}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < review.rating ? "#F59E0B" : "none"}
                                                color={i < review.rating ? "#F59E0B" : "#E5E7EB"}
                                            />
                                        ))}
                                    </div>
                                    <p className={styles.comment}>"{review.comment}"</p>
                                    <div className={styles.author}>
                                        <div className={styles.avatar}>
                                            {review.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={styles.name}>{review.name}</div>
                                            <div className={styles.productLink}>{review.productSlug.replace(/-/g, ' ')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
