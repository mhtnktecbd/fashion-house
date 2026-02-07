"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import styles from '../admin.module.css';

export default function TopBarCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '', sortNavbar: 0 });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                // We show ALL categories here, but highlight those in navbar? 
                // Req: "Admin can Add/Edit/Delete top bar menu categories".
                // This implies acting on the same pool of categories but focusing on Navbar props.
                // Let's filter or sort by showInNavbar? No, user needs to see all to enable them.
                // But let's prioritize showing enabled ones.
                setCategories(data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSave = async () => {
        const body = { ...formData, showInNavbar: true }; // Force showInNavbar when adding from here
        const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
        const method = editingId ? 'PATCH' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        setEditingId(null);
        setIsAdding(false);
        fetchCategories();
    };

    const toggleNavbar = async (cat) => {
        await fetch(`/api/admin/categories/${cat.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showInNavbar: !cat.showInNavbar })
        });
        fetchCategories();
    };

    // Filter to show only relevant or split view? 
    // "Admin can Add/EditTop bar menu categories".
    // Let's list ALL, but clearly separate "In Navbar" vs "Available".
    const navbarCats = categories.filter(c => c.showInNavbar).sort((a, b) => a.sortNavbar - b.sortNavbar);
    const otherCats = categories.filter(c => !c.showInNavbar);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Top Bar Menu</h1>
                <button
                    onClick={() => { setIsAdding(true); setFormData({ name: '', slug: '', sortNavbar: navbarCats.length + 1 }); }}
                    style={{ background: 'var(--accent)', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    + Add Menu Item
                </button>
            </div>

            {/* Active Navbar Categories */}
            <div className={styles.card}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Active Menu Items</h3>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Name</th>
                            <th>Subcategories</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isAdding && (
                            <tr>
                                <td>#</td>
                                <td>
                                    <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                    <input placeholder="Slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '8px' }} />
                                </td>
                                <td>-</td>
                                <td>
                                    <button onClick={handleSave} style={{ marginRight: '8px', color: 'green' }}><Check size={18} /></button>
                                    <button onClick={() => setIsAdding(false)} style={{ color: 'red' }}><X size={18} /></button>
                                </td>
                            </tr>
                        )}
                        {navbarCats.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    <input
                                        type="number"
                                        value={cat.sortNavbar}
                                        onChange={async (e) => {
                                            await fetch(`/api/admin/categories/${cat.id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ sortNavbar: parseInt(e.target.value) })
                                            });
                                            fetchCategories();
                                        }}
                                        style={{ width: '50px', padding: '4px' }}
                                    />
                                </td>
                                <td>
                                    <span style={{ fontWeight: 'bold' }}>{cat.name}</span>
                                    <div style={{ fontSize: '12px', color: '#888' }}>{cat.slug}</div>
                                </td>
                                <td>{cat.subCategories?.length || 0}</td>
                                <td>
                                    <button onClick={() => toggleNavbar(cat)} style={{ color: 'red', marginRight: '10px' }}>Remove from Menu</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Available Categories */}
            <div className={styles.card} style={{ marginTop: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Available Categories</h3>
                <table className={styles.dataTable}>
                    <tbody>
                        {otherCats.map(cat => (
                            <tr key={cat.id}>
                                <td>-</td>
                                <td>{cat.name}</td>
                                <td>
                                    <button onClick={() => toggleNavbar(cat)} style={{ color: 'green' }}>Add to Menu</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
