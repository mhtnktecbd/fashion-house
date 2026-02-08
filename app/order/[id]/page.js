"use client";

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Package, MapPin, CreditCard, ShoppingBag, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import styles from './order-details.module.css';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${id}`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.order);
                    setTimeline(data.timeline || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    if (loading) return (
        <>
            <div className={styles.container} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                    <p>Loading order details...</p>
                </div>
            </div>
            <Footer />
            <style jsx global>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
        </>
    );

    if (!order) return (
        <>
            <div className={styles.container} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Order not found</h2>
                    <Link href="/my-orders" style={{ color: '#2563eb', textDecoration: 'underline' }}>Return to My Orders</Link>
                </div>
            </div>
            <Footer />
        </>
    );

    // Timeline Logic
    const steps = [
        { status: 'PLACED', label: 'Order Placed', icon: ShoppingBag },
        { status: 'PROCESSING', label: 'Processing', icon: Clock },
        { status: 'DELIVERED', label: 'Delivered', icon: Truck },
        { status: 'COMPLETED', label: 'Completed', icon: CheckCircle }
    ];

    // Merge API timeline with steps to find completion
    const getStepStatus = (stepStatus) => {
        const found = timeline.find(t => t.status === stepStatus);
        const currentStatus = order.status;

        // Special case: Cancelled
        if (currentStatus === 'CANCELLED') return 'cancelled';

        // Check if passed
        const stepIndex = steps.findIndex(s => s.status === stepStatus);
        const currentIndex = steps.findIndex(s => s.status === currentStatus);

        if (found || stepIndex <= currentIndex) return 'completed';
        return 'pending';
    };

    const getStepDate = (stepStatus) => {
        const found = timeline.find(t => t.status === stepStatus);
        if (found) return new Date(found.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        // Fallback for PLACED if likely missing in timeline but in order
        if (stepStatus === 'PLACED') return new Date(order.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        return null;
    };

    return (
        <>
            <div className={styles.container} style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 20px 60px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <Link href="/my-orders" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <ChevronLeft size={16} /> Back to Orders
                    </Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 5px 0' }}>It&apos;s coming!</h1>
                        <p style={{ color: '#6b7280', margin: 0 }}>Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                        {order.status === 'CANCELLED' ? (
                            <div style={{ padding: '8px 16px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', fontWeight: '700', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <XCircle size={18} /> Cancelled
                            </div>
                        ) : (
                            <div style={{ padding: '8px 16px', background: '#ecfdf5', color: '#059669', borderRadius: '12px', fontWeight: '700', border: '1px solid #a7f3d0' }}>
                                Estimated Delivery: 3-5 Days
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '40px' }}>

                    {/* Left: Items + Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        {/* Items */}
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e5e7eb', padding: '30px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package size={20} color="#6b7280" /> Order Items
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {order.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '20px' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                                            <img
                                                src={item.product?.image || item.product?.imageUrl || '/placeholder.svg'}
                                                alt={item.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.title || item.product?.title}</div>
                                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Size: {item.size || 'N/A'} • Qty: {item.quantity}</div>
                                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>৳{item.price * item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Info Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={16} /> Delivery Address
                                </h3>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{order.guestName}</div>
                                <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>{order.guestPhone}</div>
                                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{order.guestAddress}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CreditCard size={16} /> Payment Info
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Method</span>
                                    <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{order.paymentMethod}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #e5e7eb' }}>
                                    <span style={{ color: '#111827', fontWeight: '700' }}>Total</span>
                                    <span style={{ color: '#111827', fontWeight: '800' }}>৳{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right: Timeline */}
                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e5e7eb', padding: '30px', alignSelf: 'start', position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={20} color="#6b7280" /> Order History
                        </h3>

                        <div style={{ position: 'relative', paddingLeft: '10px' }}>
                            {/* Vertical Line */}
                            <div style={{ position: 'absolute', left: '29px', top: '15px', bottom: '40px', width: '2px', background: '#f3f4f6', zIndex: 0 }} />

                            {steps.map((step, index) => {
                                const status = getStepStatus(step.status);
                                const date = getStepDate(step.status);
                                const isCompleted = status === 'completed';
                                const isCancelled = order.status === 'CANCELLED';

                                // Stop rendering future steps if cancelled, unless it's the cancelled state itself (not in this list)
                                // Actually for cancelled orders, we might want to show visual indication.

                                return (
                                    <div key={step.status} style={{ display: 'flex', gap: '20px', marginBottom: index === steps.length - 1 ? 0 : '35px', position: 'relative', zIndex: 1 }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: isCompleted ? '#111827' : 'white',
                                            border: isCompleted ? 'none' : '2px solid #e5e7eb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.3s'
                                        }}>
                                            <step.icon size={18} color={isCompleted ? 'white' : '#9ca3af'} />
                                        </div>
                                        <div style={{ paddingTop: '8px' }}>
                                            <div style={{ fontSize: '15px', fontWeight: '700', color: isCompleted ? '#111827' : '#9ca3af', marginBottom: '2px' }}>
                                                {step.label}
                                            </div>
                                            {date && (
                                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{date}</div>
                                            )}
                                            {/* If this is the current active step and not completed, maybe show "In Progress" */}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Cancelled State Injection */}
                            {order.status === 'CANCELLED' && (
                                <div style={{ display: 'flex', gap: '20px', marginTop: '35px', position: 'relative', zIndex: 1 }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <XCircle size={20} color="#dc2626" />
                                    </div>
                                    <div style={{ paddingTop: '8px' }}>
                                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>Order Cancelled</div>
                                        <div style={{ fontSize: '13px', color: '#ef4444' }}>{new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}
