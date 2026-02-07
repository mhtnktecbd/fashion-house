"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown, ImageIcon } from 'lucide-react';
import styles from '../admin.module.css';

export default function HomeCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ homeLabel: '', sortHome: 0 });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                setCategories(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const toggleHome = async (cat) => {
        await fetch(`/api/admin/categories/${cat.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showInHome: !cat.showInHome })
        });
        fetchCategories();
    };

    const saveEdit = async (id) => {
        await fetch(`/api/admin/categories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setEditingId(null);
        fetchCategories();
    };

    const homeCats = categories.filter(c => c.showInHome).sort((a, b) => a.sortHome - b.sortHome);
    const availableCats = categories.filter(c => !c.showInHome);

    return (
        <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '30px' }}>Home &quot;Shop by Category&quot;</h1>

            {/* Active Home Categories */}
            <div className={styles.card}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Displayed on Home</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {homeCats.map(cat => (
                        <div key={cat.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', background: '#fff', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }} onClick={() => toggleHome(cat)}>
                                <X size={16} color="red" />
                            </div>

                            {/* Icon/Image Preview */}
                            <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '50%', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cat.image ? <img src={cat.image} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 'bold' }}>{(cat.homeLabel || cat.name).charAt(0)}</span>}
                            </div>

                            {editingId === cat.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input
                                        type="number"
                                        placeholder="Order"
                                        value={formData.sortHome}
                                        onChange={e => setFormData({ ...formData, sortHome: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '6px' }}
                                    />
                                    <input
                                        placeholder="Label Override"
                                        value={formData.homeLabel}
                                        onChange={e => setFormData({ ...formData, homeLabel: e.target.value })}
                                        style={{ width: '100%', padding: '6px' }}
                                    />
                                    <button onClick={() => saveEdit(cat.id)} style={{ background: 'green', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{cat.homeLabel || cat.name}</div>
                                    <div style={{ fontSize: '11px', color: '#888' }}>Orig: {cat.name}</div>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Order: {cat.sortHome}</div>
                                    <button
                                        onClick={() => { setEditingId(cat.id); setFormData({ homeLabel: cat.homeLabel || '', sortHome: cat.sortHome }); }}
                                        style={{ marginTop: '10px', fontSize: '12px', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        Edit Display
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {homeCats.length === 0 && <div style={{ color: '#888', fontStyle: 'italic', padding: '20px' }}>No categories selected for homepage. Defaults will be shown.</div>}
                </div>
            </div>

            {/* Available to Add */}
            <div className={styles.card} style={{ marginTop: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Add to Homepage</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {availableCats.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => toggleHome(cat)}
                            style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Plus size={14} />
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
