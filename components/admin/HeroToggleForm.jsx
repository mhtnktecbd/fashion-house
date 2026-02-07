"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Trash2,
    Edit3,
    Plus,
    Upload,
    Loader2,
    Image as ImageIcon,
    X,
    ArrowUp,
    ArrowDown,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';
import styles from '@/app/admin/admin.module.css';
import { getHeroSlides, saveHeroSlides, getHeroConfig, saveHeroConfig } from '@/lib/heroStore';

export default function HeroToggleForm() {
    const [slides, setSlides] = useState([]);
    const [config, setConfig] = useState({ carouselEnabled: true, autoplaySpeed: 5000 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        eyebrowText: '',
        titleBn: '',
        subtitle: '',
        imageSrc: '',
        buttonText: '',
        buttonLink: '',
        isEnabled: true
    });
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setSlides(getHeroSlides());
        setConfig(getHeroConfig());
        setIsLoaded(true);
    }, []);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Simple validation
        if (file.size > 2 * 1024 * 1024) {
            showToast("File too large (>2MB)");
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await fetch("/api/admin/upload-home-tile-image", { // Reusing the same local upload API
                method: "POST",
                body: data
            });

            if (!res.ok) throw new Error(`Server Error: ${res.status}`);

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid server response (not JSON)");
            }

            const result = await res.json();
            if (result.ok) {
                setFormData(prev => ({ ...prev, imageSrc: result.url }));
                showToast("Image uploaded");
            } else {
                showToast(result.error || "Upload failed");
            }
        } catch (error) {
            showToast("Network error during upload");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveSlide = () => {
        if (!formData.titleBn) {
            showToast("Title is required");
            return;
        }

        let updatedSlides;
        if (editingId) {
            updatedSlides = slides.map(s => s.id === editingId ? { ...s, ...formData } : s);
            showToast("Slide updated");
        } else {
            const newSlide = {
                ...formData,
                id: `hero-${Date.now()}`,
                order: slides.length + 1
            };
            updatedSlides = [...slides, newSlide];
            showToast("Slide created");
        }

        setSlides(updatedSlides);
        saveHeroSlides(updatedSlides);
        resetForm();
    };

    const handleDeleteSlide = (id) => {
        if (!confirm("Delete this hero slide?")) return;
        const updatedSlides = slides.filter(s => s.id !== id);
        setSlides(updatedSlides);
        saveHeroSlides(updatedSlides);
        showToast("Deleted");
    };

    const handleToggleEnabled = (id) => {
        const updatedSlides = slides.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s);
        setSlides(updatedSlides);
        saveHeroSlides(updatedSlides);
    };

    const handleToggleCarousel = () => {
        const newConfig = { ...config, carouselEnabled: !config.carouselEnabled };
        setConfig(newConfig);
        saveHeroConfig(newConfig);
        showToast(newConfig.carouselEnabled ? "Carousel enabled" : "Carousel disabled");
    };

    const moveSlide = (index, direction) => {
        const newSlides = [...slides];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newSlides.length) return;
        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
        const reordered = newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
        setSlides(reordered);
        saveHeroSlides(reordered);
    };

    const resetForm = () => {
        setFormData({ eyebrowText: '', titleBn: '', subtitle: '', imageSrc: '', buttonText: 'SHOP NOW', buttonLink: '/shop', isEnabled: true });
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (slide) => {
        setEditingId(slide.id);
        setFormData({ ...slide });
        setIsAdding(false);
    };

    if (!isLoaded) return <div className="text-white p-10">Loading...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '40px', alignItems: 'start' }}>
            {/* Left Side: Management */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Hero Banners</h2>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button
                            onClick={handleToggleCarousel}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                background: config.carouselEnabled ? 'var(--accent)' : '#444',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '800'
                            }}
                        >
                            {config.carouselEnabled ? 'CAROUSEL ON' : 'CAROUSEL OFF'}
                        </button>
                        <button
                            className={styles.iconBtn}
                            onClick={() => { resetForm(); setIsAdding(true); }}
                            style={{ width: 'auto', padding: '0 16px', gap: '8px', background: '#000', color: '#fff', fontWeight: '700', borderRadius: '12px' }}
                        >
                            <Plus size={16} /> Add Slide
                        </button>
                    </div>
                </div>

                {(isAdding || editingId) && (
                    <div className={styles.card} style={{ marginBottom: '30px', border: '2px solid rgba(0,0,0,0.05)' }}>
                        <div className={styles.cardTitle} style={{ fontSize: '16px', marginBottom: '20px' }}>
                            {editingId ? 'Edit Slide' : 'Create Slide'}
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>EYEBROW TEXT</label>
                                    <input type="text" value={formData.eyebrowText} onChange={e => setFormData({ ...formData, eyebrowText: e.target.value })} className={styles.input} style={{ width: '100%', padding: '10px' }} placeholder="e.g. NEW COLLECTION" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>MAIN TITLE (BANGLA)</label>
                                    <input type="text" value={formData.titleBn} onChange={e => setFormData({ ...formData, titleBn: e.target.value })} className={styles.input} style={{ width: '100%', padding: '10px' }} placeholder="প্রিমিয়াম কালেকশন..." />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>SUBTITLE</label>
                                    <input type="text" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} className={styles.input} style={{ width: '100%', padding: '10px' }} placeholder="একটি ছোট স্লোগান..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>BUTTON TEXT</label>
                                        <input type="text" value={formData.buttonText} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} className={styles.input} style={{ width: '100%', padding: '10px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>LINK</label>
                                        <input type="text" value={formData.buttonLink} onChange={e => setFormData({ ...formData, buttonLink: e.target.value })} className={styles.input} style={{ width: '100%', padding: '10px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    style={{ padding: '8px 15px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    Upload Image
                                    <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept="image/*" />
                                </div>
                                <input type="text" value={formData.imageSrc} onChange={e => setFormData({ ...formData, imageSrc: e.target.value })} className={styles.input} style={{ background: 'none', border: 'none', borderBottom: '1px solid #ddd', fontSize: '12px', width: '200px' }} placeholder="Or paste URL..." />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                                    <input type="checkbox" checked={formData.isEnabled} onChange={e => setFormData({ ...formData, isEnabled: e.target.checked })} />
                                    Enabled
                                </label>
                                <button
                                    onClick={handleSaveSlide}
                                    style={{ background: '#000', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Save size={16} /> Save Slide
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.card} style={{ padding: '0', overflow: 'hidden' }}>
                    <table className={styles.dataTable} style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Order</th>
                                <th style={{ width: '100px' }}>Image</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slides.map((slide, index) => (
                                <tr key={slide.id}>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => moveSlide(index, -1)} disabled={index === 0} style={{ padding: '4px', background: 'none', border: 'none', opacity: index === 0 ? 0.2 : 1, cursor: 'pointer' }}><ArrowUp size={14} /></button>
                                            <button onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1} style={{ padding: '4px', background: 'none', border: 'none', opacity: index === slides.length - 1 ? 0.2 : 1, cursor: 'pointer' }}><ArrowDown size={14} /></button>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ width: '70px', height: '40px', background: '#f5f5f5', borderRadius: '6px', overflow: 'hidden' }}>
                                            {slide.imageSrc ? (
                                                <img src={slide.imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}><ImageIcon size={14} /></div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '800', fontSize: '13px' }}>{slide.titleBn}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>{slide.eyebrowText} • {slide.buttonLink}</div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleEnabled(slide.id)}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                border: 'none',
                                                background: slide.isEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                                                color: slide.isEnabled ? '#10b981' : '#666',
                                                fontSize: '10px',
                                                fontWeight: '900',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {slide.isEnabled ? 'ACTIVE' : 'OFF'}
                                        </button>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => startEdit(slide)} className={styles.iconBtn} style={{ width: '32px', height: '32px' }}><Edit3 size={14} /></button>
                                            <button onClick={() => handleDeleteSlide(slide.id)} className={styles.iconBtn} style={{ width: '32px', height: '32px', color: '#ef4444' }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Side: Preview */}
            <div style={{ position: 'sticky', top: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-dim)', letterSpacing: '1px' }}>LIVE PREVIEW</span>
                </div>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '9/16',
                    background: '#111',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                    border: '4px solid #fff'
                }}>
                    {formData.imageSrc ? (
                        <img src={formData.imageSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}><ImageIcon size={60} /></div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px', color: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '8px' }}>{formData.eyebrowText || "NEW COLLECTION"}</div>
                        <h3 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1.2' }}>{formData.titleBn || "আপনার টাইটেল"}</h3>
                        <p style={{ fontSize: '13px', opacity: 0.7, margin: '0 0 20px 0', lineHeight: '1.4' }}>{formData.subtitle || "এখানে আপনার সাবটাইটেল দেখাবে।"}</p>
                        <div style={{ padding: '12px 24px', background: '#fff', color: '#000', borderRadius: '50px', display: 'inline-block', fontWeight: '800', fontSize: '12px' }}>
                            {formData.buttonText || "SHOP NOW"}
                        </div>
                    </div>
                </div>
            </div>

            {toast && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '12px 30px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
                    {toast}
                </div>
            )}
        </div>
    );
}
