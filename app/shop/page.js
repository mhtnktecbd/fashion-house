import Navbar from '@/components/Navbar';
import CategoryCatalog from '@/components/CategoryCatalog';

export default function ShopPage() {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: '80vh' }}>
                <CategoryCatalog />
            </main>
        </>
    );
}
