"use client";

import Button from '@/components/Button';
import Input from '@/components/Input';
import { useState } from 'react';

export default function CourierPage() {
    const [orders, setOrders] = useState([
        { id: '1001', customer: 'Rahim', status: 'Processing', provider: '', tracking: '' },
        { id: '1002', customer: 'Karim', status: 'Processing', provider: '', tracking: '' },
    ]);

    const providers = ["Pathao", "Steadfast", "RedX", "Paperfly", "eCourier"];

    const handleUpdate = (id, field, value) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
    };

    const handleShip = (id) => {
        // API call to update order
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Shipped' } : o));
        alert(`Order #${id} marked as Shipped!`);
    };

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Courier Dispatch</h1>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '10px' }}>Order ID</th>
                            <th style={{ padding: '10px' }}>Customer</th>
                            <th style={{ padding: '10px' }}>Courier Provider</th>
                            <th style={{ padding: '10px' }}>Tracking ID</th>
                            <th style={{ padding: '10px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>#AB-{order.id}</td>
                                <td style={{ padding: '10px' }}>{order.customer}</td>
                                <td style={{ padding: '10px' }}>
                                    <select
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                        value={order.provider}
                                        onChange={(e) => handleUpdate(order.id, 'provider', e.target.value)}
                                    >
                                        <option value="">Select Provider</option>
                                        {providers.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter ID"
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                        value={order.tracking}
                                        onChange={(e) => handleUpdate(order.id, 'tracking', e.target.value)}
                                    />
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <Button
                                        onClick={() => handleShip(order.id)}
                                        disabled={order.status === 'Shipped' || !order.provider || !order.tracking}
                                    >
                                        {order.status === 'Shipped' ? 'Shipped' : 'Mark Shipped'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
