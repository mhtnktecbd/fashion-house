"use client";

import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CategoryCatalog from '@/components/CategoryCatalog';
import { useCategories } from '@/context/CategoryContext';

export default function DynamicCategoryPage() {
    const params = useParams();
    const slug = params?.slug;
    const { categories, isLoaded } = useCategories();

    // Find category for title mapping if needed, or just pass slug
    const categoryObj = isLoaded ? categories.find(c => c.slug === slug) : null;

    return (
        <>
            <Navbar />
            <main style={{ minHeight: '80vh' }}>
                <CategoryCatalog category={slug} />
            </main>
        </>
    );
}
