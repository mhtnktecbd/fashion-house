"use client";

import { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Search,
    Check
} from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
                setStats(data.stats || { pending: 0, processing: 0, completed: 0, revenue: 0 });
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        if (!orderId) {
            console.error("Update failed: Missing Order ID");
            alert("Error: Cannot update order without ID");
            return;
        }

        try {
            console.log(`Updating order ${orderId} to ${newStatus}...`);
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                console.log("Update success:", data);
                fetchOrders(); // Refresh
            } else {
                console.error("Update failed:", data);
                alert(`Failed to update status: ${data.message || data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Update network error:", error);
            alert("Network error updating order");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.guestPhone?.includes(searchTerm) ||
            order.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id?.includes(searchTerm) ||
            order.orderNumber?.toString().includes(searchTerm);

        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return { background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' };
            case 'PROCESSING': return { background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' };
            case 'DELIVERED': return { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' };
            case 'CANCELLED': return { background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' };
            default: return { background: 'rgba(0,0,0,0.05)', color: '#666' };
        }
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                    <h1 className={styles.sectionTitle} style={{ marginBottom: '8px' }}>Order Management</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: '500' }}>Manage customer orders and track sales performance.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '4px' }}>TOTAL REVENUE</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent)' }}>৳{stats.revenue.toLocaleString()}</div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className={styles.card} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><Clock size={80} /></div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#ca8a04', letterSpacing: '1px', marginBottom: '12px' }}>PENDING</div>
                    <div style={{ fontSize: '32px', fontWeight: '900' }}>{stats.pending}</div>
                </div>
                <div className={styles.card} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><ShoppingBag size={80} /></div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#2563eb', letterSpacing: '1px', marginBottom: '12px' }}>PROCESSING</div>
                    <div style={{ fontSize: '32px', fontWeight: '900' }}>{stats.processing}</div>
                </div>
                <div className={styles.card} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><CheckCircle2 size={80} /></div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#16a34a', letterSpacing: '1px', marginBottom: '12px' }}>COMPLETED</div>
                    <div style={{ fontSize: '32px', fontWeight: '900' }}>{stats.completed}</div>
                </div>
                <div className={styles.card} style={{ padding: '24px', background: '#000', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}><ShoppingBag size={80} /></div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '12px' }}>TOTAL ORDERS</div>
                    <div style={{ fontSize: '32px', fontWeight: '900' }}>{orders.length}</div>
                </div>
            </div>

            {/* Filters and Table */}
            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder="Search by name, phone or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px 12px 45px',
                                borderRadius: '12px',
                                border: '1px solid #eee',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['ALL', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setStatusFilter(cat)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: statusFilter === cat ? '#000' : 'rgba(0,0,0,0.05)',
                                    color: statusFilter === cat ? '#fff' : '#666',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.dataTable} style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Details</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#999' }}>Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#999' }}>No orders found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <div style={{ fontWeight: '800', fontSize: '11px', color: 'var(--text-dim)' }}>
                                                {order.orderNumber ? `#${order.orderNumber}` : `#${order.id.slice(0, 8).toUpperCase()}`}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#999' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <div style={{ fontWeight: '800', fontSize: '14px' }}>{order.guestName}</div>
                                            <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>{order.guestPhone}</div>
                                        </td>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <div style={{ fontSize: '12px', color: '#444', marginBottom: '8px', maxWidth: '300px', whiteSpace: 'normal', fontWeight: '500' }}>
                                                {order.guestAddress}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
                                                {order.items && order.items.length > 0 ? (
                                                    order.items.map((item, idx) => (
                                                        <div key={idx}>
                                                            <span style={{ fontWeight: '700' }}>{item.quantity}x</span> {item.title}
                                                            <span style={{ color: '#888' }}>
                                                                {' ('}
                                                                {item.color && item.color !== 'Default' ? item.color : ''}
                                                                {item.color && item.color !== 'Default' && item.size && item.size !== 'FREE' ? ', ' : ''}
                                                                {item.size && item.size !== 'FREE' ? item.size : ''}
                                                                {')'}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span>{order.paymentMethod.toUpperCase()} • 0 items</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'top', fontWeight: '900' }}>৳{order.totalAmount}</td>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: '900',
                                                ...getStatusStyle(order.status)
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'PROCESSING')}
                                                        className={styles.iconBtn}
                                                        title="Process Order"
                                                        style={{ color: '#2563eb' }}
                                                    >
                                                        <ArrowRight size={14} />
                                                    </button>
                                                )}
                                                {order.status === 'PROCESSING' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                                                        className={styles.iconBtn}
                                                        title="Mark as Delivered"
                                                        style={{ color: '#16a34a' }}
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'CANCELLED')}
                                                        className={styles.iconBtn}
                                                        title="Cancel Order"
                                                        style={{ color: '#dc2626' }}
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
