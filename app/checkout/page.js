import CheckoutClient from '@/components/CheckoutClient';

export const metadata = {
    title: 'Checkout - AuthenticBazar',
    description: 'Complete your purchase',
};

export default function CheckoutPage() {
    return (
        <main className="container" style={{ padding: '40px 0' }}>
            <CheckoutClient />
        </main>
    );
}
