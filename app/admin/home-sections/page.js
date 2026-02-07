"use client";

import { useState, useEffect } from 'react';
import { useProducts } from '@/context/ProductContext';
import styles from '../admin.module.css';

export default function HomeSectionsAdmin() {
    const [sections, setSections] = useState([]);
    const { products } = useProducts();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Local editing state for Categories ---
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState(null);

    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        try {
            const res = await fetch('/api/home/sections');
            const data = await res.json();
            if (data.success) {
                // API already normalizes, but let's ensure local state is sorted
                setSections(data.sections);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateState = (newSections) => {
        // Normalization happens on save, but for UI stability we just re-sort locally if needed
        // Assuming manipulation actions keep order somewhat sane, but we rely on index mainly
        setSections(newSections);
    };

    const handleReset = async () => {
        if (!confirm("Reset to default sections? This will clear all customizations.")) return;
        try {
            // To reset, we send an empty array or specific reset flag? 
            // Actually `demoStore` seeds defaults if empty. So passing [] might work if we implemented it that way.
            // But `saveHomeSections` writes what we send. 
            // Let's manually clear it via a new mechanism or just empty array and reload.
            // Wait, demoStore seeds if EMPTY.
            const res = await fetch('/api/home/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([])
            });
            // After saving empty, the next GET will re-seed.
            if (res.ok) {
                await loadSections();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleSection = (id) => {
        const updated = sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
        updateState(updated);
    };

    const moveSection = (index, direction) => {
        if (index + direction < 0 || index + direction >= sections.length) return;
        const newSections = [...sections];
        const temp = newSections[index];
        newSections[index] = newSections[index + direction];
        newSections[index + direction] = temp;
        // detailed order will be fixed on save
        updateState(newSections);
    };

    const deleteSection = (id) => {
        if (!confirm("Are you sure?")) return;
        const updated = sections.filter(s => s.id !== id);
        updateState(updated);
    };

    // Add Section (Insert Below)
    const addSectionBelow = (index, type) => {
        const newSection = {
            id: 'sec_' + Date.now(),
            type,
            title: type === 'category_grid' ? 'Collection' : (type === 'flash_sale' ? 'Flash Sale' : 'New Arrivals'),
            subtitle: type === 'flash_sale' ? 'Ends Soon!' : '',
            enabled: true,
            order: 0, // Placeholder
            viewAllLink: type === 'category_grid' ? '/shop' : '/shop?sort=newest',
            items: type === 'category_grid' ? [] : undefined,
            mode: type === 'product_grid' ? 'newest' : (type === 'flash_sale' ? 'featured' : undefined),
            limit: type === 'product_grid' ? 8 : (type === 'flash_sale' ? 4 : undefined),
            productSlugs: [],
            endsAt: type === 'flash_sale' ? new Date(Date.now() + 86400000).toISOString().slice(0, 16) : undefined
        };

        const newSections = [...sections];
        newSections.splice(index + 1, 0, newSection);
        updateState(newSections);
    };

    const updateSectionField = (id, field, value) => {
        const updated = sections.map(s => s.id === id ? { ...s, [field]: value } : s);
        updateState(updated);
    };

    // Category Item Handlers
    const addCategoryItem = (sectionId) => {
        if (!newItem || !newItem.title) return alert("Title is required");
        const itemSlug = newItem.slug || newItem.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const updated = sections.map(s => {
            if (s.id === sectionId) {
                const items = s.items || [];
                return { ...s, items: [...items, { ...newItem, slug: itemSlug, id: Date.now().toString() }] };
            }
            return s;
        });
        updateState(updated);
        setNewItem(null);
    };

    const deleteCategoryItem = (sectionId, index) => {
        if (!confirm("Remove item?")) return;
        const updated = sections.map(s => {
            if (s.id === sectionId) {
                const items = [...s.items];
                items.splice(index, 1);
                return { ...s, items };
            }
            return s;
        });
        updateState(updated);
    };

    const moveCategoryItem = (sectionId, index, direction) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section || !section.items) return;
        if (index + direction < 0 || index + direction >= section.items.length) return;
        const updated = sections.map(s => {
            if (s.id === sectionId) {
                const items = [...s.items];
                const temp = items[index];
                items[index] = items[index + direction];
                items[index + direction] = temp;
                return { ...s, items };
            }
            return s;
        });
        updateState(updated);
    };

    // Manually fetch products for selector
    const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/home/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sections)
            });
            const data = await res.json();
            if (data.success) {
                loadSections(); // Reload to get normalized data (ids/orders)
                alert('Saved successfully!');
            } else {
                alert('Failed to save.');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#fff' }}>Loading configuration...</div>;

    return (
        <div style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>Home Sections</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Manage homepage layout and conversion blocks.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleReset} className={styles.secondaryBtn} style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>Reset Defaults</button>
                    <button onClick={handleSave} style={{
                        padding: '12px 24px',
                        background: '#2dd4bf',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(45, 212, 191, 0.4)'
                    }}>Save Changes</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sections.map((section, index) => (
                    <div key={section.id} className={styles.card} style={{ position: 'relative', overflow: 'hidden', borderLeft: section.enabled ? '4px solid #2dd4bf' : '4px solid #ef4444' }}>

                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    background: section.type === 'flash_sale' ? '#fef2f2' : (section.type === 'category_grid' ? '#eff6ff' : '#f0fdf4'),
                                    color: section.type === 'flash_sale' ? '#ef4444' : (section.type === 'category_grid' ? '#3b82f6' : '#16a34a'),
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase'
                                }}>
                                    {section.type.replace('_', ' ')}
                                </span>
                                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Order: {section.order}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => moveSection(index, -1)} disabled={index === 0} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>↑</button>
                                <button onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>↓</button>
                                <button onClick={() => toggleSection(section.id)} style={{ padding: '0 12px', borderRadius: '8px', background: section.enabled ? '#dcfce7' : '#fee2e2', color: section.enabled ? '#166534' : '#991b1b', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>{section.enabled ? 'Active' : 'Disabled'}</button>
                                <button onClick={() => deleteSection(section.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                            </div>
                        </div>

                        {/* Config Form */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                            <div>
                                <label className={styles.label}>Title</label>
                                <input className={styles.input} value={section.title} onChange={e => updateSectionField(section.id, 'title', e.target.value)} />
                            </div>
                            <div>
                                <label className={styles.label}>Subtitle</label>
                                <input className={styles.input} value={section.subtitle || ''} onChange={e => updateSectionField(section.id, 'subtitle', e.target.value)} />
                            </div>
                            {section.type !== 'flash_sale' && (
                                <div>
                                    <label className={styles.label}>Link</label>
                                    <input className={styles.input} value={section.viewAllLink || ''} onChange={e => updateSectionField(section.id, 'viewAllLink', e.target.value)} />
                                </div>
                            )}
                        </div>

                        {/* Flash Sale Settings */}
                        {section.type === 'flash_sale' && (
                            <div style={{ background: '#fff1f2', borderRadius: '12px', padding: '16px', border: '1px solid #fecdd3', marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#be123c', fontWeight: '800', textTransform: 'uppercase' }}>⚡ Flash Sale Config</h4>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div>
                                        <label className={styles.label} style={{ color: '#be123c' }}>End Date & Time</label>
                                        <input type="datetime-local" className={styles.input} value={section.endsAt || ''} onChange={e => updateSectionField(section.id, 'endsAt', e.target.value)} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                                        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: '#be123c' }}>
                                            <input type="checkbox" checked={section.hideWhenEnded} onChange={e => updateSectionField(section.id, 'hideWhenEnded', e.target.checked)} />
                                            Auto-hide when ended
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Category Grid Items */}
                        {section.type === 'category_grid' && (
                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Grid Items</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {(section.items || []).map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                                                {item.image && <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <div style={{ flex: 1, fontSize: '14px', fontWeight: '600' }}>{item.title}</div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={() => moveCategoryItem(section.id, idx, -1)} disabled={idx === 0} style={{ cursor: 'pointer', padding: '2px 6px' }}>↑</button>
                                                <button onClick={() => moveCategoryItem(section.id, idx, 1)} disabled={idx === (section.items?.length || 0) - 1} style={{ cursor: 'pointer', padding: '2px 6px' }}>↓</button>
                                                <button onClick={() => deleteCategoryItem(section.id, idx)} style={{ color: 'red', cursor: 'pointer', padding: '2px 6px' }}>×</button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Item Inline */}
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                        {newItem && newItem.sectionId === section.id ? (
                                            <>
                                                <input className={styles.input} placeholder="Title" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} style={{ flex: 1 }} />
                                                <input className={styles.input} placeholder="Image URL" value={newItem.image || ''} onChange={e => setNewItem({ ...newItem, image: e.target.value })} style={{ flex: 1 }} />
                                                <button onClick={() => addCategoryItem(section.id)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}>Add</button>
                                                <button onClick={() => setNewItem(null)} style={{ background: '#e2e8f0', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}>Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setNewItem({ sectionId: section.id, title: '', image: '' })} style={{ width: '100%', padding: '8px', border: '1px dashed #cbd5e1', background: 'white', borderRadius: '6px', color: '#64748b', cursor: 'pointer' }}>+ Add Category Item</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Product Grid / Flash Sale Config */}
                        {(section.type === 'product_grid' || section.type === 'flash_sale') && (
                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <select className={styles.input} value={section.mode} onChange={e => updateSectionField(section.id, 'mode', e.target.value)}>
                                        <option value="newest">Newest First</option>
                                        <option value="featured">Featured</option>
                                        <option value="bestseller">Best Sellers</option>
                                        <option value="manual">Manual Selection</option>
                                    </select>
                                    <input type="number" className={styles.input} style={{ width: '80px' }} value={section.limit || 8} onChange={e => updateSectionField(section.id, 'limit', Number(e.target.value))} placeholder="Limit" />
                                </div>
                                {section.mode === 'manual' && (
                                    <div style={{ marginTop: '10px' }}>
                                        <input className={styles.input} placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
                                        <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                                            {filteredProducts.map(p => (
                                                <div key={p.id}
                                                    onClick={() => {
                                                        const current = section.productSlugs || [];
                                                        updateSectionField(section.id, 'productSlugs', current.includes(p.slug) ? current.filter(s => s !== p.slug) : [...current, p.slug]);
                                                    }}
                                                    style={{ padding: '6px', cursor: 'pointer', background: (section.productSlugs || []).includes(p.slug) ? '#f0fdf4' : 'white', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}
                                                >
                                                    {p.title} {(section.productSlugs || []).includes(p.slug) && '✓'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Add Below Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #e5e7eb' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center' }}>Insert Below:</span>
                            <button onClick={() => addSectionBelow(index, 'category_grid')} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Category Grid</button>
                            <button onClick={() => addSectionBelow(index, 'product_grid')} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #86efac', cursor: 'pointer' }}>Product Grid</button>
                            <button onClick={() => addSectionBelow(index, 'flash_sale')} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer' }}>Flash Sale</button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
