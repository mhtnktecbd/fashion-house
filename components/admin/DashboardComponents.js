"use client";

import React from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { MoreVertical, TrendingUp } from 'lucide-react';
import styles from '@/app/admin/admin.module.css';

export function StatCard({ label, value, change, icon: Icon, iconBg, iconColor }) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statHeader}>
                <div>
                    <div className={styles.statLabel}>{label}</div>
                    <div className={styles.statValue}>{value}</div>
                </div>
                <div className={styles.statIcon} style={{ background: iconBg, color: iconColor }}>
                    <Icon size={24} />
                </div>
            </div>
            <div className={styles.statChange}>
                <TrendingUp size={14} style={{ marginRight: 4 }} />
                {change} This week
            </div>
        </div>
    );
}

export function RevenueReports({ data }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>
                Revenue Reports
                <div style={{ display: 'flex', gap: 15, fontSize: 12, fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, background: '#2dd4bf', borderRadius: '50%' }}></span> Revenue
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%' }}></span> Sales
                    </span>
                </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2dd4bf"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRev)"
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="transparent"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function SalesByCategory({ data }) {
    const COLORS = ['#2dd4bf', '#3b82f6', '#f59e0b', '#a855f7'];

    return (
        <div className={styles.card} style={{ height: '100%' }}>
            <div className={styles.cardTitle}>
                Sales by Category
                <MoreVertical size={18} color="#9ca3af" cursor="pointer" />
            </div>
            <div style={{ width: '100%', height: 220, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>৳8,521</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Total</div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 25 }}>
                {data.map((item, index) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>
                        <span style={{ width: 10, height: 10, background: COLORS[index % COLORS.length], borderRadius: '3px' }}></span>
                        {item.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DeliveryProgress() {
    const items = [
        { name: 'Inner Wear', progress: 75, color: '#2dd4bf' },
        { name: 'Denim Jacket', progress: 55, color: '#3b82f6' },
        { name: 'Silk Saree', progress: 25, color: '#a855f7' }
    ];

    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>
                Delivery Progress
                <MoreVertical size={18} color="#9ca3af" cursor="pointer" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {items.map(item => (
                    <div key={item.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-on-card)' }}>{item.name}</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                            <div style={{ width: `${item.progress}%`, height: '100%', background: item.color, borderRadius: 5, boxShadow: `0 0 15px ${item.color}44` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function RecentOrdersTable() {
    const orders = [
        { id: '7728', name: 'Macbook Pro', date: '18 June, 2020', amount: '৳1,050', status: 'Delivered' },
        { id: '5567', name: 'iPhone 12 Pro', date: '18 June, 2020', amount: '৳840', status: 'Shipping' },
        { id: '7855', name: 'iPhone 11 Pro Max', date: '18 June, 2020', amount: '৳700', status: 'Delivered' },
    ];

    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>Recent Orders</div>
            <div style={{ overflowX: 'auto' }}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td style={{ color: '#9ca3af' }}>#{order.id}</td>
                                <td style={{ fontWeight: 700, color: '#fff' }}>{order.name}</td>
                                <td style={{ color: '#9ca3af' }}>{order.date}</td>
                                <td style={{ color: '#2dd4bf', fontWeight: 800 }}>{order.amount}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className={styles.iconBtn} style={{ width: 32, height: 32, borderRadius: 8 }}>
                                        <MoreVertical size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
