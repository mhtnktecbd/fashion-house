"use client";

import { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED

    useEffect(() => {
        const fetchReviews = async () => {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            setReviews(data);
            setLoading(false);
        };
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const res = await fetch('/api/admin/reviews');
        const data = await res.json();
        setReviews(data);
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        await fetch('/api/admin/reviews', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        fetchReviews();
    };

    const deleteReview = async (id) => {
        if (!confirm('Delete this review?')) return;
        await fetch('/api/admin/reviews', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchReviews();
    };

    const filteredReviews = reviews.filter(r => {
        if (filter === 'ALL') return true;
        return r.status === filter;
    });

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Reviews Moderation</h1>

            <div className="flex gap-2 mb-6">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border ${filter === f ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredReviews.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No reviews found.</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4 w-1/3">Comment</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReviews.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 font-medium text-sm text-gray-900">{r.productSlug}</td>
                                    <td className="p-4 text-sm">
                                        <div className="font-semibold">{r.name}</div>
                                        <div className="text-gray-400 text-xs">{r.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} color={i < r.rating ? "currentColor" : "#ddd"} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {r.title && <div className="font-bold mb-1">{r.title}</div>}
                                        {r.comment}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            r.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {r.status !== 'APPROVED' && (
                                                <button onClick={() => updateStatus(r.id, 'APPROVED')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Approve">
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            {r.status !== 'REJECTED' && (
                                                <button onClick={() => updateStatus(r.id, 'REJECTED')} className="p-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100" title="Reject">
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => deleteReview(r.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
