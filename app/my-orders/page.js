"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Package, ChevronRight, LogOut, Phone, ShoppingBag } from 'lucide-react';
import styles from './my-orders.module.css';

export default function MyOrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('guest_phone');
        if (stored) setGuestPhone(stored);
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [session, guestPhone]);

    const fetchOrders = async () => {
        const p = session?.user ? null : (guestPhone || null);
        if (session || p) {
            setLoading(true);
            try {
                let url = '/api/orders/my';
                if (p) url += `?phone=${p}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const handleGuestLogin = (e) => {
        e.preventDefault();
        if (phone.length === 11) {
            localStorage.setItem('guest_phone', phone);
            setGuestPhone(phone);
        } else {
            alert("Please enter a valid 11-digit phone number");
        }
    };

    const getStatusColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'pending': return { bg: '#fef9c3', text: '#ca8a04', border: '#fde047' };
            case 'processing': return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
            case 'delivered': return { bg: '#dcfce7', text: '#16a34a', border: '#86efac' };
            case 'cancelled': return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
            default: return { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' };
        }
    };

    const Header = () => (
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>My Orders</h1>
            <p style={{ color: '#6b7280' }}>Track and manage your recent purchases</p>
        </div>
    );

    if (loading) return (
        <>
            <Navbar />
            <div className={styles.container} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                    <p>Loading orders...</p>
                </div>
            </div>
            <Footer />
        </>
    );

    if (!session && !guestPhone) {
        return (
            <>
                <Navbar />
                <div className={styles.container} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '400px', width: '100%', padding: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                        <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Package size={30} color="#2563eb" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>Track Your Order</h2>
                        <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '15px' }}>Enter the phone number used during checkout to view your order history.</p>

                        <form onSubmit={handleGuestLogin}>
                            <div style={{ position: 'relative', marginBottom: '15px' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    placeholder="017..."
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    maxLength={11}
                                    style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none', transition: 'all 0.2s' }}
                                />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '14px', background: '#111827', color: 'white', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Find Orders <ChevronRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.container} style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 20px 60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0 }}>My Orders</h1>
                    {!session && (
                        <button
                            onClick={() => {
                                localStorage.removeItem('guest_phone');
                                setGuestPhone('');
                                setOrders([]);
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: '#fef2f2' }}
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    )}
                </div>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '1px dashed #e5e7eb' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f9fafb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <ShoppingBag size={32} color="#9ca3af" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No orders found</h3>
                        <p style={{ color: '#6b7280', marginBottom: '25px' }}>Looks like you haven't placed any orders yet.</p>
                        <Link href="/shop" style={{ display: 'inline-flex', padding: '12px 24px', background: '#111827', color: 'white', borderRadius: '12px', fontWeight: '600', textDecoration: 'none' }}>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {orders.map(order => {
                            const statusStyle = getStatusColor(order.status);
                            return (
                                <Link href={`/order/${order.id}`} key={order.id} style={{ display: 'block', textDecoration: 'none' }}>
                                    <div className={styles.orderCard} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e5e7eb', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                                                    Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                background: statusStyle.bg,
                                                color: statusStyle.text,
                                                border: `1px solid ${statusStyle.border}`
                                            }}>
                                                {order.status}
                                            </div>
                                        </div>

                                        <div style={{ height: '1px', background: '#f3f4f6', margin: '0 0 16px 0' }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                                                <span style={{ color: '#6b7280' }}>Items: <strong style={{ color: '#111827' }}>{order.items.length}</strong></span>
                                                <span style={{ color: '#6b7280' }}>Total: <strong style={{ color: '#111827' }}>৳{order.totalAmount}</strong></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: '#2563eb' }}>
                                                View Details <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
            <style jsx global>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}
