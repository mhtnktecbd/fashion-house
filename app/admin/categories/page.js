"use client";

import { useState, useEffect, useRef, Fragment } from 'react';
import styles from '../admin.module.css';
import {
    Plus,
    Trash2,
    Edit2,
    ArrowUp,
    ArrowDown,
    Check,
    X,
    Eye,
    EyeOff,
    Upload,
    ImageIcon,
    Loader2,
    ChevronRight,
    ChevronDown,
    CornerDownRight
} from 'lucide-react';
import { adminEn } from '@/lib/i18n/admin.en';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({}); // { catId: boolean }
    const [selectedCategory, setSelectedCategory] = useState(null); // For Toggles Panel

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [addingSubTo, setAddingSubTo] = useState(null); // Parent ID

    const [formData, setFormData] = useState({ name: '', slug: '', image: '', parentId: null });
    const [panelData, setPanelData] = useState(null); // State for the Toggle Panel
    const [uploading, setUploading] = useState(null);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);
    const tileFileInputRef = useRef(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setCategories(data.categories);
                    if (selectedCategory) {
                        // Update selected object with fresh data
                        const fresh = data.categories.find(c => c.id === selectedCategory.id) ||
                            data.categories.flatMap(c => c.subCategories).find(sc => sc && sc.id === selectedCategory.id);
                        if (fresh) setSelectedCategory(fresh);
                    }
                } else {
                    console.error(data.error);
                }
            }
        } catch (error) {
            console.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Sync panel data when selection changes
    useEffect(() => {
        if (selectedCategory) {
            setPanelData({
                showInNavbar: selectedCategory.showInNavbar || false,
                showInHome: selectedCategory.showInHome || false,
                showOnHomeTiles: selectedCategory.showOnHomeTiles || false,
                tileOrder: selectedCategory.tileOrder || 0,
                tileImage: selectedCategory.tileImage || ''
            });
        } else {
            setPanelData(null);
        }
    }, [selectedCategory]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const toggleExpand = (id, e) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFileUpload = async (e, field, isPanel = false) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(field);
        const data = new FormData();
        data.append("file", file);
        data.append("folder", "categories");

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (result.url) {
                if (isPanel) {
                    setPanelData(prev => ({ ...prev, [field]: result.url }));
                } else {
                    setFormData(prev => ({ ...prev, [field]: result.url }));
                }
                showToast("Image uploaded successfully");
            }
        } catch (error) {
            showToast("Upload failed");
        } finally {
            setUploading(null);
        }
    };

    const generateSlug = (name) => {
        return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', image: '', parentId: null });
        setIsAdding(false);
        setEditingId(null);
        setAddingSubTo(null);
    };

    const startAddMain = () => {
        resetForm();
        setIsAdding(true);
    };

    const startAddSub = (parentId, e) => {
        e.stopPropagation();
        resetForm();
        setAddingSubTo(parentId);
        setFormData(prev => ({ ...prev, parentId }));
        // Expand the parent to show form
        setExpanded(prev => ({ ...prev, [parentId]: true }));
    };

    const startEdit = (cat, e) => {
        e.stopPropagation();
        resetForm();
        setEditingId(cat.id);
        // Also select for panel
        setSelectedCategory(cat);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            image: cat.image || '',
            parentId: cat.parentId
        });
    };

    const handleSave = async (e) => {
        e?.stopPropagation();
        if (!formData.name || !formData.slug) {
            showToast("Name and Slug are required");
            return;
        }

        try {
            const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
            const method = editingId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok && (method === 'PATCH' || data.success)) {
                await fetchCategories();
                resetForm();
                showToast(editingId ? "Category updated" : "Category added");
            } else {
                showToast(data.error || "Operation failed");
            }
        } catch (error) {
            showToast("Network error");
        }
    };

    const handleSavePanel = async () => {
        if (!selectedCategory || !panelData) return;

        try {
            const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(panelData)
            });

            if (res.ok) {
                await fetchCategories(); // Will update selectedCategory via useEffect logic if we implement recursive find, or just refetch
                showToast("Display settings saved");
            } else {
                showToast("Failed to save settings");
            }
        } catch (error) {
            showToast("Network error");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchCategories();
                if (selectedCategory?.id === id) setSelectedCategory(null);
                showToast("Category deleted");
            } else {
                const err = await res.json();
                showToast(err.error || "Delete failed");
            }
        } catch (error) {
            showToast("Network error");
        }
    };

    const handleToggleActive = async (cat, e) => {
        e.stopPropagation();
        try {
            await fetch(`/api/admin/categories/${cat.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !cat.isActive })
            });
            fetchCategories();
        } catch (error) { /* quiet fail */ }
    };

    // Render Row Function
    const renderRow = (cat, level = 0) => {
        const isEditingThis = editingId === cat.id;
        const isParent = level === 0;
        const hasChildren = cat.subCategories && cat.subCategories.length > 0;
        const isExpanded = expanded[cat.id];
        const isSelected = selectedCategory?.id === cat.id;

        // Indentation styles
        const paddingLeft = level === 0 ? '20px' : '50px';

        if (isEditingThis) {
            return renderFormRow();
        }

        return (
            <Fragment key={cat.id || cat._id || cat.slug}>
                <tr
                    key={cat.id || cat._id || cat.slug}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                        background: isSelected ? '#e0f2fe' : (level > 0 ? '#fafafa' : '#fff'),
                        cursor: 'pointer',
                        borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent'
                    }}
                >
                    <td style={{ padding: '15px 20px', paddingLeft, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isParent && (
                            <button onClick={(e) => toggleExpand(cat.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#666' }}>
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        )}
                        {level > 0 && <CornerDownRight size={14} color="#ccc" />}

                        <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#f0f0f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {cat.image ? (
                                <img src={cat.image} alt="Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <ImageIcon size={16} color="#ccc" />
                            )}
                        </div>
                        <span style={{ fontWeight: isParent ? '700' : '500', fontSize: '15px' }}>{cat.name}</span>
                        {cat.subCategories?.length > 0 && <span style={{ fontSize: '11px', color: '#888', background: '#f0f0f0', padding: '2px 6px', borderRadius: '10px' }}>{cat.subCategories.length}</span>}
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                        <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{cat.slug}</code>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                        <button
                            onClick={(e) => handleToggleActive(cat, e)}
                            style={{
                                padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700',
                                background: cat.isActive ? '#e6fffa' : '#fff5f5',
                                color: cat.isActive ? '#10b981' : '#c53030'
                            }}
                        >
                            {cat.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                            {cat.isActive ? 'ACTIVE' : 'HIDDEN'}
                        </button>
                    </td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            {isParent && (
                                <button onClick={(e) => startAddSub(cat.id, e)} className={styles.iconBtn} title="Add Subcategory"><Plus size={16} /></button>
                            )}
                            <button onClick={(e) => startEdit(cat, e)} className={styles.iconBtn}><Edit2 size={16} /></button>
                            <button onClick={(e) => handleDelete(cat.id, e)} className={styles.iconBtn} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
                {/* Subcategories */}
                {isExpanded && hasChildren && cat.subCategories.map(sub => renderRow(sub, level + 1))}
                {/* Adding Subcategory Form Position */}
                {isExpanded && addingSubTo === cat.id && renderFormRow(level + 1)}
            </Fragment>
        );
    };

    const renderFormRow = (level = 0) => {
        return (
            <tr key="form" style={{ background: '#e0f2fe' }}>
                <td style={{ padding: '15px 20px', paddingLeft: level === 0 ? '20px' : '50px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {level > 0 && <CornerDownRight size={14} color="#0284c7" />}
                        <div
                            style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#fff', border: '1px dashed #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {uploading === 'image' ? <Loader2 size={16} className="animate-spin" /> : formData.image ? <img src={formData.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={14} color="#0284c7" />}
                            <input type="file" hidden ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} accept="image/*" />
                        </div>
                        <input
                            type="text"
                            placeholder="Category Name"
                            value={formData.name}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    name: val,
                                    slug: prev.slug || generateSlug(val)
                                }));
                            }}
                            autoFocus
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '180px' }}
                        />
                    </div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                    <input
                        type="text"
                        placeholder="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                    />
                </td>
                <td style={{ padding: '15px 20px' }}>
                    <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold' }}>{editingId ? 'EDITING' : 'NEW'}</span>
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button onClick={handleSave} className={styles.iconBtn} style={{ color: '#10b981', background: '#fff' }}><Check size={18} /></button>
                        <button onClick={resetForm} className={styles.iconBtn} style={{ color: '#ef4444', background: '#fff' }}><X size={18} /></button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Categories</h1>
                <button
                    onClick={startAddMain}
                    disabled={isAdding || editingId}
                    style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', cursor: 'pointer', opacity: (isAdding || editingId) ? 0.5 : 1 }}
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px', background: '#333', color: '#fff',
                    padding: '12px 20px', borderRadius: '8px', zIndex: 999
                }}>
                    {toast}
                </div>
            )}

            <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                <div className={styles.card} style={{ padding: '0', overflow: 'hidden', flex: 1 }}>
                    <table className={styles.dataTable}>
                        <thead style={{ background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
                            <tr>
                                <th style={{ padding: '12px 20px', textAlign: 'left', color: '#666' }}>Name</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', color: '#666' }}>Slug</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', color: '#666', width: '100px' }}>Status</th>
                                <th style={{ padding: '12px 20px', textAlign: 'right', color: '#666', width: '140px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isAdding && !addingSubTo && renderFormRow(0)}
                            {categories.length === 0 && !isAdding && !loading && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No categories found.</td>
                                </tr>
                            )}
                            {categories.map(cat => renderRow(cat))}
                            {loading && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Loading...</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* Toggle Panel */}
                <div className={styles.card} style={{ width: '300px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', opacity: selectedCategory ? 1 : 0.6, pointerEvents: selectedCategory ? 'all' : 'none' }}>
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Display Toggles</h3>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                            {selectedCategory ? `Settings for: ${selectedCategory.name}` : 'Select a category'}
                        </p>
                    </div>

                    {selectedCategory && panelData && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={panelData.showInNavbar}
                                        onChange={e => setPanelData(p => ({ ...p, showInNavbar: e.target.checked }))}
                                    />
                                    <span style={{ fontSize: '14px' }}>Show in Navbar</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={panelData.showInHome}
                                        onChange={e => setPanelData(p => ({ ...p, showInHome: e.target.checked }))}
                                    />
                                    <span style={{ fontSize: '14px' }}>Show in Home</span>
                                </label>

                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={panelData.showOnHomeTiles}
                                            onChange={e => setPanelData(p => ({ ...p, showOnHomeTiles: e.target.checked }))}
                                        />
                                        <span style={{ fontSize: '14px' }}>Show as Home Tile</span>
                                    </label>

                                    {panelData.showOnHomeTiles && (
                                        <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div>
                                                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Tile Order</label>
                                                <input
                                                    type="number"
                                                    value={panelData.tileOrder}
                                                    onChange={e => setPanelData(p => ({ ...p, tileOrder: parseInt(e.target.value) || 0 }))}
                                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Tile Image</label>
                                                <div
                                                    onClick={() => tileFileInputRef.current?.click()}
                                                    style={{ width: '100%', height: '80px', border: '1px dashed #ccc', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff' }}
                                                >
                                                    {uploading === 'tileImage' ? <Loader2 className="animate-spin" /> : panelData.tileImage ? <img src={panelData.tileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '11px', color: '#999' }}>Click to Upload</span>}
                                                </div>
                                                <input type="file" hidden ref={tileFileInputRef} onChange={(e) => handleFileUpload(e, 'tileImage', true)} accept="image/*" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSavePanel}
                                style={{ background: '#000', color: '#fff', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
                            >
                                Save Display Settings
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
