"use client";

import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import en from '@/lib/i18n/en';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <>
                <Navbar />
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛒</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>{en.cart.empty}</h2>
                    <p style={{ color: 'var(--secondary)', marginBottom: '32px' }}>{en.cart.empty}</p>
                    <Link href="/">
                        <Button style={{ borderRadius: '50px' }}>{en.cart.continue}</Button>
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="container" style={{ padding: '40px 20px' }}>
                <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '40px' }}>{en.cart.title}</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>
                    {/* Cart Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {cart.map(item => (
                            <div key={item.id} style={{
                                display: 'flex',
                                gap: '20px',
                                padding: '20px',
                                background: '#fff',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: '#f4f4f4',
                                    borderRadius: '8px',
                                    flexShrink: 0
                                    /* Image placeholder logic would go here if we implemented it fully */
                                }}>
                                    {/* If we had next/image accessible here properly we'd use it */}
                                </div>

                                <div style={{ flexGrow: 1 }}>
                                    <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>{item.title}</h3>
                                    <div style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '12px' }}>
                                        {en.product.price}: ৳{item.price}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            overflow: 'hidden'
                                        }}>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >-</button>
                                            <span style={{ padding: '0 12px', fontWeight: '600', minWidth: '32px', textAlign: 'center' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >+</button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            style={{
                                                color: 'var(--error)',
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div style={{ fontWeight: '700', fontSize: '18px' }}>
                                    ৳{item.price * item.quantity}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div style={{
                        background: '#fff',
                        padding: '32px',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        position: 'sticky',
                        top: '100px'
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Order Summary</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px' }}>
                            <span style={{ color: 'var(--secondary)' }}>{en.cart.subtotal}</span>
                            <span style={{ fontWeight: '600' }}>৳{cartTotal}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '15px' }}>
                            <span style={{ color: 'var(--secondary)' }}>{en.cart.delivery}</span>
                            <span style={{ fontWeight: '600' }}>৳{(120).toString()}</span> {/* Placeholder */}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', fontSize: '18px', fontWeight: '800' }}>
                            <span>{en.cart.total}</span>
                            <span>৳{cartTotal + 120}</span>
                        </div>

                        <Link href="/checkout">
                            <Button fullWidth style={{ borderRadius: '50px', padding: '16px' }}>
                                {en.cart.checkout}
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}


