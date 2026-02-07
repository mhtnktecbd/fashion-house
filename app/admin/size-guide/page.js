"use client";

import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function AdminSizeGuidePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        enabled: true,
        title: 'Size Guide',
        content: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchSizeGuide();
    }, []);

    const fetchSizeGuide = async () => {
        try {
            const res = await fetch('/api/admin/size-guide');
            const data = await res.json();
            if (data) setFormData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/size-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Size Guide saved successfully');
            } else {
                alert('Failed to save');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Size Guide Manager</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>Manage the global size guide displayed on product pages</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={styles.iconBtn}
                    style={{
                        width: 'auto',
                        padding: '10px 20px',
                        background: 'var(--accent)',
                        color: '#000',
                        borderColor: 'transparent',
                        fontWeight: '700',
                        gap: '8px',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className={styles.card}>
                <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <label className={styles.cardTitle} style={{ cursor: 'pointer', justifyContent: 'flex-start', gap: '10px', fontSize: '16px', marginBottom: 0 }}>
                        <input
                            type="checkbox"
                            className={styles.input}
                            checked={formData.enabled}
                            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                        />
                        Enable Size Guide on Storefront
                    </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted-on-card)', marginBottom: '8px' }}>Modal Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={styles.input}
                            style={{ width: '100%' }}
                            placeholder="e.g. Size Guide"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted-on-card)', marginBottom: '8px' }}>
                            Content (Markdown supported)
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={12}
                            className={styles.input}
                            style={{ width: '100%', fontFamily: 'monospace', lineHeight: '1.5' }}
                            placeholder="# Standard Sizing&#10;| Size | Chest |&#10;|------|-------|&#10;| S    | 34    |"
                        />
                        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted-on-card)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            Supports basic Markdown. Use pipes | for tables.
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted-on-card)', marginBottom: '8px' }}>Reference Image URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className={styles.input}
                            style={{ width: '100%' }}
                            placeholder="https://..."
                        />
                        {formData.imageUrl && (
                            <div style={{ marginTop: '15px', padding: '10px', border: '1px solid var(--card-border)', borderRadius: '8px', width: 'fit-content', background: '#fff' }}>
                                <img src={formData.imageUrl} alt="Preview" style={{ height: '150px', objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
