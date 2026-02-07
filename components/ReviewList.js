"use client";

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export default function ReviewList({ productSlug, refreshTrigger }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average: 0, count: 0 });
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews/product/${productSlug}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
                setStats({ average: data.average, count: data.count });
            }
        } catch (error) {
            console.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productSlug, refreshTrigger]);

    if (loading) return <div style={{ padding: '20px 0' }}>Loading reviews...</div>;

    return (
        <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Reviews
                <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>({stats.count})</span>
            </h2>

            {stats.count > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.average}</div>
                    <div style={{ display: 'flex' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={20}
                                fill={stats.average >= star ? "#FFD700" : (stats.average >= star - 0.5 ? "#FFD700" : "none")}
                                color={stats.average >= star - 0.5 ? "#FFD700" : "#ddd"}
                            />
                        ))}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Based on {stats.count} reviews</div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No reviews yet. Be the first to write one!</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{review.name}</div>
                                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={14}
                                                fill={review.rating >= star ? "#FFD700" : "none"}
                                                color={review.rating >= star ? "#FFD700" : "#ddd"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            {review.title && <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>{review.title}</div>}
                            <p style={{ color: '#444', lineHeight: '1.5', fontSize: '14px' }}>{review.comment}</p>
                            {review.adminNote && (
                                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginTop: '10px', fontSize: '13px' }}>
                                    <strong>Response:</strong> {review.adminNote}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
