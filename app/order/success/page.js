"use client";


import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || 'N/A';
    const orderNumber = searchParams.get('orderNumber');
    const displayId = orderNumber || orderId;

    // WhatsApp Message
    const encodedMessage = encodeURIComponent(
        `হ্যালো, আমি অর্ডার #${displayId} কনফার্ম করতে চাই।`
    );
    const waLink = `https://wa.me/8801700000000?text=${encodedMessage}`;

    return (
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px' }}>
            <div style={{
                width: '80px',
                height: '80px',
                background: '#e8f5e9',
                color: '#2e7d32',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                margin: '0 auto 24px'
            }}>
                ✓
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
                আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!
            </h1>

            <p style={{ color: 'var(--secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                ধন্যবাদ আমাদের সাথে থাকার জন্য। আপনার অর্ডার নাম্বার: <strong style={{ color: 'black' }}>#{displayId}</strong>
                <br />
                আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Button fullWidth style={{ background: '#25D366', borderColor: '#25D366', borderRadius: '50px' }}>
                        WhatsApp এ কনফার্ম করুন
                    </Button>
                </a>

                <Link href="/">
                    <Button variant="outline" fullWidth style={{ borderRadius: '50px' }}>
                        আরও কেনাকাটা করুন
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <>
            <Suspense fallback={<div className="container">Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </>
    );
}
