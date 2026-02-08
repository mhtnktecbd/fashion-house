"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';

export default function CategorySidebar() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setCategories(data);
                        // Default expand all
                        const allExpanded = {};
                        data.forEach(c => allExpanded[c.id] = true);
                        setExpanded(allExpanded);
                        return;
                    }
                }
            } catch (error) {
                console.warn("Using mock categories due to fetch error:", error);
            }

            // Mock Data Fallback
            const MOCK_CATEGORIES = [
                {
                    id: 'm1', name: 'Men-Mock', slug: 'men',
                    subCategories: [
                        { id: 's1', name: 'T-Shirts', slug: 'men-t-shirts' },
                        { id: 's2', name: 'Jeans', slug: 'men-jeans' },
                        { id: 's3', name: 'Shoes', slug: 'men-shoes' },
                        { id: 's3b', name: 'Watches', slug: 'men-watches' }
                    ]
                },
                {
                    id: 'm2', name: 'Women', slug: 'women',
                    subCategories: [
                        { id: 's4', name: 'Dresses', slug: 'women-dresses' },
                        { id: 's5', name: 'Tops', slug: 'women-tops' },
                        { id: 's6', name: 'Bags', slug: 'women-bags' },
                        { id: 's6b', name: 'Jewelry', slug: 'women-jewelry' }
                    ]
                },
                {
                    id: 'm3', name: 'Kids', slug: 'kids',
                    subCategories: [
                        { id: 's7', name: 'Boys', slug: 'kids-boys' },
                        { id: 's8', name: 'Girls', slug: 'kids-girls' }
                    ]
                }
            ];
            setCategories(MOCK_CATEGORIES);
            const allExpanded = {};
            MOCK_CATEGORIES.forEach(c => allExpanded[c.id] = true);
            setExpanded(allExpanded);
            setLoading(false);
        };

        fetchCategories();
    }, []);

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                </div>
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <FolderOpen size={18} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">Categories</h3>
            </div>

            {/* List */}
            <div className="p-3">
                <ul className="space-y-1">
                    {categories.map(category => (
                        <li key={category.id} className="group">
                            <button
                                onClick={() => toggleExpand(category.id)}
                                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-all text-left group-hover:shadow-sm"
                            >
                                <span className="font-semibold text-gray-800 text-sm">{category.name}</span>
                                <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                                    {expanded[category.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </span>
                            </button>

                            {/* Subcategories */}
                            {expanded[category.id] && category.subCategories?.length > 0 && (
                                <ul className="mt-1 mb-2 space-y-0.5">
                                    {category.subCategories.map(sub => (
                                        <li key={sub.id}>
                                            <Link
                                                href={`/shop/${sub.slug}`}
                                                className="block py-2 pl-9 pr-3 text-sm text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors border-l-2 border-transparent hover:border-indigo-600"
                                            >
                                                {sub.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
