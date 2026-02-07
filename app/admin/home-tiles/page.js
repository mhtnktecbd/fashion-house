"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    ArrowUp,
    ArrowDown,
    Upload,
    Image as ImageIcon,
    Eye,
    EyeOff,
    Loader2,
    Save
} from 'lucide-react';
import styles from '../admin.module.css';
import {
    getHomeTiles,
    saveHomeTiles,
    getHomeTilesConfig,
    saveHomeTilesConfig
} from '@/lib/homeTilesStore';

export default function HomeTilesAdmin() {
    const [tiles, setTiles] = useState([]);
    const [config, setConfig] = useState({ sectionEnabled: true });
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', slug: '', imageUrl: '', isEnabled: true });
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setTiles(getHomeTiles());
        setConfig(getHomeTilesConfig());
        setIsLoaded(true);
    }, []);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const generateSlug = (text) => {
        return text.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = generateSlug(title);
        setFormData(prev => ({ ...prev, title, slug }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await fetch("/api/admin/upload-home-tile-image", {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (result.ok) {
                setFormData(prev => ({ ...prev, imageUrl: result.url }));
                showToast("Upload successful");
            } else {
                showToast(result.error || "Upload failed");
            }
        } catch (error) {
            showToast("Network error during upload");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveTile = () => {
        if (!formData.title || !formData.slug) {
            showToast("Title and Slug are required");
            return;
        }

        let updatedTiles;
        if (editingId) {
            updatedTiles = tiles.map(t => t.id === editingId ? { ...t, ...formData } : t);
            showToast("Tile updated");
        } else {
            const newTile = {
                ...formData,
                id: `tile-${Date.now()}`,
                sortOrder: tiles.length + 1
            };
            updatedTiles = [...tiles, newTile];
            showToast("Tile created");
        }

        setTiles(updatedTiles);
        saveHomeTiles(updatedTiles);
        resetForm();
    };

    const handleDeleteTile = (id) => {
        if (!confirm("Are you sure you want to delete this tile?")) return;
        const updatedTiles = tiles.filter(t => t.id !== id);
        setTiles(updatedTiles);
        saveHomeTiles(updatedTiles);
        showToast("Tile deleted");
    };

    const handleToggleEnabled = (id) => {
        const updatedTiles = tiles.map(t => t.id === id ? { ...t, isEnabled: !t.isEnabled } : t);
        setTiles(updatedTiles);
        saveHomeTiles(updatedTiles);
    };

    const handleToggleSection = () => {
        const newConfig = { ...config, sectionEnabled: !config.sectionEnabled };
        setConfig(newConfig);
        saveHomeTilesConfig(newConfig);
        showToast(newConfig.sectionEnabled ? "Section enabled" : "Section disabled");
    };

    const moveTile = (index, direction) => {
        const newTiles = [...tiles];
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= newTiles.length) return;

        [newTiles[index], newTiles[targetIndex]] = [newTiles[targetIndex], newTiles[index]];

        const orderedTiles = newTiles.map((t, idx) => ({ ...t, sortOrder: idx + 1 }));

        setTiles(orderedTiles);
        saveHomeTiles(orderedTiles);
    };

    const resetForm = () => {
        setFormData({ title: '', slug: '', imageUrl: '', isEnabled: true });
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (tile) => {
        setEditingId(tile.id);
        setFormData({
            title: tile.title,
            slug: tile.slug,
            imageUrl: tile.imageUrl,
            isEnabled: tile.isEnabled
        });
        setIsAdding(false);
    };

    if (!isLoaded) return <div style={{ color: '#fff' }}>Loading Admin Panel...</div>;

    return (
        <div style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Home Style Tiles</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>Manage the style category grid on your storefront</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: config.sectionEnabled ? 'var(--accent)' : 'var(--text-dim)' }}>
                            {config.sectionEnabled ? 'Section Active' : 'Section Hidden'}
                        </span>
                        <button
                            onClick={handleToggleSection}
                            style={{
                                width: '50px',
                                height: '26px',
                                borderRadius: '13px',
                                background: config.sectionEnabled ? 'var(--accent)' : '#444',
                                border: 'none',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#fff',
                                position: 'absolute',
                                top: '3px',
                                left: config.sectionEnabled ? '27px' : '3px',
                                transition: 'all 0.3s'
                            }} />
                        </button>
                    </div>
                    <button
                        className={styles.iconBtn}
                        onClick={() => { resetForm(); setIsAdding(true); }}
                        style={{ width: 'auto', padding: '0 20px', gap: '8px', background: 'var(--accent)', color: '#000', fontWeight: '700' }}
                    >
                        <Plus size={20} />
                        Add Tile
                    </button>
                </div>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: '30px', right: '30px', background: '#10b981', color: '#fff',
                    padding: '12px 24px', borderRadius: '12px', zIndex: 1000, fontWeight: '700', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                    {toast}
                </div>
            )}

            {(isAdding || editingId) && (
                <div className={styles.card} style={{ marginBottom: '40px', border: '2px solid var(--accent)' }}>
                    <div className={styles.cardTitle}>
                        {editingId ? 'Edit Tile' : 'Add New Tile'}
                        <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '30px' }}>
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '16px',
                                background: 'rgba(0,0,0,0.05)',
                                border: '1px dashed rgba(0,0,0,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {uploading ? (
                                <Loader2 size={32} className="animate-spin" />
                            ) : formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <>
                                    <Upload size={32} style={{ color: 'var(--text-dim)' }} />
                                    <span style={{ fontSize: '12px', marginTop: '8px', color: 'var(--text-dim)', fontWeight: '700' }}>UPLOAD IMAGE</span>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept="image/*" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted-on-card)' }}>TITLE</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Printed Short Sleeve"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted-on-card)' }}>SLUG (/shop/[slug])</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. printed-short-sleeve"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)', fontWeight: '600' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '700' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isEnabled}
                                        onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                                        style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
                                    />
                                    Enable Tile
                                </label>
                                <button
                                    onClick={handleSaveTile}
                                    style={{
                                        padding: '12px 30px',
                                        borderRadius: '12px',
                                        background: '#000',
                                        color: '#fff',
                                        border: 'none',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <Save size={18} />
                                    {editingId ? 'Update Tile' : 'Create Tile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.card} style={{ padding: '0', overflow: 'hidden' }}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th style={{ width: '100px' }}>Order</th>
                            <th style={{ width: '120px' }}>Preview</th>
                            <th>Title</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiles.map((tile, index) => (
                            <tr key={tile.id}>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => moveTile(index, -1)} disabled={index === 0} className={styles.iconBtn} style={{ width: '32px', height: '32px' }}><ArrowUp size={16} /></button>
                                        <button onClick={() => moveTile(index, 1)} disabled={index === tiles.length - 1} className={styles.iconBtn} style={{ width: '32px', height: '32px' }}><ArrowDown size={16} /></button>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ width: '80px', height: '100px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {tile.imageUrl ? (
                                            <img src={tile.imageUrl} alt={tile.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon size={28} style={{ opacity: 0.2 }} />
                                        )}
                                    </div>
                                </td>
                                <td style={{ fontWeight: '700' }}>{tile.title}</td>
                                <td>
                                    <code style={{ background: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>/shop/{tile.slug}</code>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleToggleEnabled(tile.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            background: tile.isEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                                            color: tile.isEnabled ? '#10b981' : '#666',
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {tile.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {tile.isEnabled ? 'ENABLED' : 'HIDDEN'}
                                    </button>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => startEdit(tile)} className={styles.iconBtn}><Edit2 size={18} /></button>
                                        <button onClick={() => handleDeleteTile(tile.id)} className={styles.iconBtn} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
