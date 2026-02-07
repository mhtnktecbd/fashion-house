import Navbar from '@/components/Navbar';
import CategoryCatalog from '@/components/CategoryCatalog';

export default function WomenPage() {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: '80vh' }}>
                <CategoryCatalog category="Women" />
            </main>
        </>
    );
}
