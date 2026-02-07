import Navbar from '@/components/Navbar';
import CategoryCatalog from '@/components/CategoryCatalog';

export default function MenPage() {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: '80vh' }}>
                <CategoryCatalog category="Men" />
            </main>
        </>
    );
}
