"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import Button from './Button';
import styles from './Input.module.css'; // Reusing input styles

export default function ReviewForm({ productSlug, onReviewSubmitted }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productSlug,
                    rating,
                    name,
                    email,
                    title,
                    comment
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'রিভিউ সাবমিট করার জন্য ধন্যবাদ! রিভিউটি অনুমোদনের জন্য অপেক্ষা করছে।' });
                setName('');
                setEmail('');
                setTitle('');
                setComment('');
                setRating(5);
                if (onReviewSubmitted) onReviewSubmitted();
            } else {
                setMessage({ type: 'error', text: data.error || 'Something went wrong' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit review' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '40px', padding: '24px', background: '#f9f9f9', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Write a Review</h3>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: (hoverRating || rating) >= star ? '#FFD700' : '#ddd' }}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star size={24} fill={(hoverRating || rating) >= star ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Name *</label>
                        <input
                            required
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Email (Optional)</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Review Title (Optional)</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your experience"
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Review *</label>
                    <textarea
                        required
                        className={styles.input}
                        style={{ height: '100px', resize: 'vertical' }}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us what you liked or disliked"
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Review'}
                </Button>

                {message && (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        borderRadius: '6px',
                        background: message.type === 'success' ? '#e6fffa' : '#fff5f5',
                        color: message.type === 'success' ? '#008060' : '#c53030',
                        fontSize: '14px'
                    }}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
}
