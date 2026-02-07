"use client";

import { useState, useEffect, Fragment } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    ChevronDown,
    ChevronRight,
    Loader2,
    CornerDownRight
} from 'lucide-react';
import styles from '../admin.module.css';

// Fixed categories order to ensure they appear as requested
const FIXED_CATEGORIES = ['Men', 'Women', 'Teens', 'Kids', 'Sports'];

export default function SubCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({}); // { parentId: boolean }
    const [error, setError] = useState(null);

    // Edit/Add States
    const [editingId, setEditingId] = useState(null);
    const [addingSubTo, setAddingSubTo] = useState(null); // Parent ID
    const [processing, setProcessing] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        sortNavbar: 0,
        sortOrder: 0,
        isActive: true,
        showInNavbar: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            // STEP 1: Fetch from the CORRECT endpoint
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();

                if (data.success) {
                    // Sort main categories: Fixed ones first, then others
                    const sorted = data.categories.sort((a, b) => {
                        const aIndex = FIXED_CATEGORIES.indexOf(a.name);
                        const bIndex = FIXED_CATEGORIES.indexOf(b.name);

                        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                        if (aIndex !== -1) return -1;
                        if (bIndex !== -1) return 1;

                        return (a.sortNavbar || 0) - (b.sortNavbar || 0);
                    });

                    setCategories(sorted);

                    // Default expand all main categories for better visibility
                    const defaultExpanded = {};
                    sorted.forEach(c => defaultExpanded[c.id] = true);
                    setExpanded(prev => ({ ...defaultExpanded, ...prev }));
                } else {
                    setError(data.error || "Failed to load categories.");
                }
            } else {
                setError("Failed to load categories from server.");
            }
        } catch (err) {
            console.error(err);
            setError("Network error loading categories.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug
    const handleNameChange = (val) => {
        const newData = { ...formData, name: val };

        // Auto-slug if it's a new entry (not editing a slug explicitly)
        if (!editingId && val) {
            let prefix = '';
            if (addingSubTo) {
                const parent = categories.find(c => c.id === addingSubTo);
                if (parent) prefix = parent.slug + '-';
            }
            const simpleSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            newData.slug = prefix + simpleSlug;
        } else if (!val) {
            newData.slug = '';
        }

        setFormData(newData);
    }

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', sortNavbar: 0, sortOrder: 0, isActive: true, showInNavbar: true });
        setEditingId(null);
        setAddingSubTo(null);
    };

    // STEP 3: Add Subcategory Button Logic
    const startAddSub = (parentId) => {
        resetForm();
        setAddingSubTo(parentId);
        setFormData(prev => ({ ...prev, isActive: true, showInNavbar: true }));
        setExpanded(prev => ({ ...prev, [parentId]: true }));
    };

    const startEdit = (cat) => {
        resetForm();
        setEditingId(cat.id);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            isActive: cat.isActive,
            showInNavbar: cat.showInNavbar,
            sortNavbar: cat.sortNavbar || 0,
            sortOrder: cat.sortOrder || 0
        });
    };

    // STEP 5: API Route utilization (using existing categories POST/PATCH)
    const handleSave = async () => {
        if (!formData.name || !formData.slug) return alert("Name and Slug required");

        setProcessing(true);
        try {
            const body = { ...formData };
            if (addingSubTo) body.parentId = addingSubTo;

            const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
            const method = editingId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok && (method === 'PATCH' || data.success)) {
                await fetchCategories();
                resetForm();
            } else {
                alert(data.error || "Failed to save");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id, hasChildren) => {
        if (hasChildren) {
            if (!confirm("WARNING: This category has subcategories. Deleting it might delete them too or leave them orphaned. Continue?")) return;
        } else {
            if (!confirm("Delete this category?")) return;
        }

        try {
            await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleNavbar = async (cat) => {
        await fetch(`/api/admin/categories/${cat.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showInNavbar: !cat.showInNavbar })
        });
        fetchCategories();
    };

    const handleToggleActive = async (cat) => {
        await fetch(`/api/admin/categories/${cat.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !cat.isActive })
        });
        fetchCategories();
    };

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>Sub Categories</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '5px' }}>Manage navbar dropdown hierarchies</p>
                </div>
            </div>

            {/* STEP 1: Error Handling */}
            {error && (
                <div style={{
                    padding: '16px',
                    color: '#991b1b',
                    background: '#fecaca',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    fontWeight: '600',
                    border: '1px solid #ef4444'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* STEP 2: Premium Admin Table Layout */}
            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '24px' }}>Category Name</th>
                            <th>Slug</th>
                            <th>In Navbar</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat, index) => {
                            const isEditing = editingId === cat.id;
                            const hasChildren = cat.subCategories && cat.subCategories.length > 0;
                            const isEx = expanded[cat.id];
                            const isFixed = FIXED_CATEGORIES.includes(cat.name);

                            // --- EDITING MAIN CATEGORY ---
                            if (isEditing) {
                                return (
                                    <tr key={cat.id || index} style={{ background: 'rgba(45, 212, 191, 0.05)' }}>
                                        <td style={{ paddingLeft: '24px' }}>
                                            <input
                                                autoFocus
                                                value={formData.name}
                                                onChange={e => handleNameChange(e.target.value)}
                                                disabled={isFixed}
                                                className={styles.input}
                                                style={{ width: '200px' }}
                                            />
                                            {isFixed && <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: '8px', fontWeight: '600' }}>LOCKED</span>}
                                        </td>
                                        <td>
                                            <input
                                                value={formData.slug}
                                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                disabled={isFixed}
                                                className={styles.input}
                                                style={{ width: '150px' }}
                                            />
                                        </td>
                                        <td>
                                            <input type="checkbox" checked={formData.showInNavbar} onChange={e => setFormData({ ...formData, showInNavbar: e.target.checked })} />
                                        </td>
                                        <td>
                                            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                            <button onClick={handleSave} className={styles.iconBtn} style={{ color: '#10b981', marginRight: '8px' }} disabled={processing}><Check size={18} /></button>
                                            <button onClick={resetForm} className={styles.iconBtn} style={{ color: '#ef4444' }}><X size={18} /></button>
                                        </td>
                                    </tr>
                                )
                            }

                            // --- DISPLAY MAIN CATEGORY ---
                            return (
                                <Fragment key={cat.id || cat.slug || index}>
                                    <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button
                                                onClick={() => toggleExpand(cat.id)}
                                                style={{
                                                    border: 'none', background: 'rgba(255,255,255,0.1)', cursor: 'pointer',
                                                    color: 'var(--text-primary)', width: '24px', height: '24px', borderRadius: '6px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    visibility: (hasChildren || addingSubTo === cat.id) ? 'visible' : 'hidden'
                                                }}
                                            >
                                                {isEx ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </button>
                                            <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>{cat.name}</span>
                                            {cat.subCategories?.length > 0 && (
                                                <span style={{ fontSize: '11px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                                                    {cat.subCategories.length}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{cat.slug}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
                                                background: cat.showInNavbar ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: cat.showInNavbar ? '#10b981' : '#ef4444'
                                            }}>
                                                {cat.showInNavbar ? 'SHOWN' : 'HIDDEN'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '11px', fontWeight: '700',
                                                color: cat.isActive ? '#10b981' : '#ef4444'
                                            }}>
                                                {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={() => startAddSub(cat.id)}
                                                    style={{
                                                        background: 'var(--accent)',
                                                        color: '#000',
                                                        border: 'none',
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        fontWeight: '700',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    <Plus size={14} strokeWidth={3} /> Add Subcategory
                                                </button>

                                                <button onClick={() => startEdit(cat)} className={styles.iconBtn}><Edit2 size={16} /></button>
                                                {!isFixed && <button onClick={() => handleDelete(cat.id, hasChildren)} className={styles.iconBtn} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* --- SUBCATEGORIES SECTION --- */}
                                    {isEx && (
                                        <>
                                            {/* Existing Subcategories */}
                                            {cat.subCategories?.map((sub, sIndex) => {
                                                const isSubEditing = editingId === sub.id;

                                                if (isSubEditing) {
                                                    return (
                                                        <tr key={sub.id || sub.slug || sIndex} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                            <td style={{ paddingLeft: '64px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <CornerDownRight size={14} style={{ opacity: 0.5 }} />
                                                                <input
                                                                    autoFocus
                                                                    value={formData.name}
                                                                    onChange={e => handleNameChange(e.target.value)}
                                                                    className={styles.input}
                                                                    style={{ width: '180px' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    value={formData.slug}
                                                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                                    className={styles.input}
                                                                    style={{ width: '140px' }}
                                                                />
                                                            </td>
                                                            <td><input type="checkbox" checked={formData.showInNavbar} onChange={e => setFormData({ ...formData, showInNavbar: e.target.checked })} /></td>
                                                            <td><input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} /></td>
                                                            <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                                                <button onClick={handleSave} className={styles.iconBtn} style={{ color: '#10b981', marginRight: '8px' }} disabled={processing}><Check size={16} /></button>
                                                                <button onClick={resetForm} className={styles.iconBtn} style={{ color: '#ef4444' }}><X size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    )
                                                }

                                                return (
                                                    <tr key={sub.id || sub.slug || sIndex} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                        <td style={{ padding: '12px 64px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <CornerDownRight size={14} style={{ color: 'var(--text-dim)' }} />
                                                            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{sub.name}</span>
                                                        </td>
                                                        <td style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{sub.slug}</td>
                                                        <td>
                                                            {sub.showInNavbar && <span style={{ fontSize: '10px', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', borderRadius: '4px' }}>MENU</span>}
                                                        </td>
                                                        <td>
                                                            {sub.isActive ? <span style={{ color: '#10b981', fontSize: '12px' }}>●</span> : <span style={{ color: '#ef4444', fontSize: '12px' }}>●</span>}
                                                        </td>
                                                        <td style={{ textAlign: 'right', paddingRight: '24px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                                            <button onClick={() => startEdit(sub)} className={styles.iconBtn} style={{ opacity: 0.7 }}><Edit2 size={14} /></button>
                                                            <button onClick={() => handleDelete(sub.id, false)} className={styles.iconBtn} style={{ color: '#ef4444', opacity: 0.7 }}><Trash2 size={14} /></button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* --- ADD NEW SUBCATEGORY ROW --- */}
                                            {addingSubTo === cat.id && (
                                                <tr style={{ background: 'rgba(45, 212, 191, 0.05)', borderLeft: '3px solid var(--accent)' }}>
                                                    <td style={{ paddingLeft: '64px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CornerDownRight size={14} style={{ color: 'var(--accent)' }} />
                                                        <input
                                                            autoFocus
                                                            placeholder="Subcategory Name"
                                                            value={formData.name}
                                                            onChange={e => handleNameChange(e.target.value)}
                                                            className={styles.input}
                                                            style={{ width: '180px', borderColor: 'var(--accent)' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            placeholder="slug-auto"
                                                            value={formData.slug}
                                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                            className={styles.input}
                                                            style={{ width: '140px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={formData.showInNavbar} onChange={e => setFormData({ ...formData, showInNavbar: e.target.checked })} />
                                                            In Menu
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                                            Active
                                                        </label>
                                                    </td>
                                                    <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                                        <button
                                                            onClick={handleSave}
                                                            disabled={processing}
                                                            style={{
                                                                background: '#10b981', color: '#fff', border: 'none',
                                                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                                                marginRight: '8px', fontWeight: 'bold', fontSize: '12px'
                                                            }}
                                                        >
                                                            {processing ? <Loader2 size={12} className="animate-spin" /> : 'SAVE'}
                                                        </button>
                                                        <button
                                                            onClick={resetForm}
                                                            style={{
                                                                background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                                                fontWeight: 'bold', fontSize: '12px'
                                                            }}
                                                        >
                                                            CANCEL
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>

                {categories.length === 0 && !loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        No categories found. Check /api/admin/categories.
                    </div>
                )}
            </div>
        </div>
    );
}
