"use client";

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

const AVAILABLE_ICONS = ['ShieldCheck', 'Truck', 'RotateCcw', 'Award', 'Star', 'CheckCircle', 'Package'];

import styles from '../admin.module.css';

export default function AdminTrustBadgesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({ enabled: true, items: [] });

    useEffect(() => {
        fetch('/api/admin/trust-badges')
            .then(res => res.json())
            .then(data => {
                if (data) setConfig(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/trust-badges', {
                method: 'POST',
                body: JSON.stringify(config)
            });
            alert('Saved successfully');
        } catch (e) {
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        setConfig(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), icon: 'ShieldCheck', text: 'New Badge' }]
        }));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...config.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setConfig({ ...config, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = config.items.filter((_, i) => i !== index);
        setConfig({ ...config, items: newItems });
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Trust Badges</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>Manage the trust indicators shown on product pages</p>
                </div>
                <button
                    onClick={handleSave}
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
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.mb30}>
                    <label className={styles.cardTitle} style={{ cursor: 'pointer', justifyContent: 'flex-start', gap: '10px', fontSize: '16px' }}>
                        <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={e => setConfig({ ...config, enabled: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                        />
                        Enable Trust Badges Row
                    </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {config.items.map((item, idx) => (
                        <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted-on-card)' }}>Icon</label>
                                <select
                                    value={item.icon}
                                    onChange={(e) => updateItem(idx, 'icon', e.target.value)}
                                    className={styles.input}
                                    style={{ width: '140px' }}
                                >
                                    {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                </select>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted-on-card)' }}>Badge Text</label>
                                <input
                                    type="text"
                                    value={item.text}
                                    onChange={(e) => updateItem(idx, 'text', e.target.value)}
                                    className={styles.input}
                                    placeholder="e.g. 100% Authentic"
                                />
                            </div>

                            <div style={{ alignSelf: 'flex-end' }}>
                                <button
                                    onClick={() => removeItem(idx)}
                                    className={styles.iconBtn}
                                    style={{ color: '#ef4444', borderColor: 'transparent', background: 'rgba(239, 68, 68, 0.1)' }}
                                    title="Remove Badge"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addItem}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            color: 'var(--accent)', fontWeight: '600',
                            background: 'transparent', border: 'none',
                            cursor: 'pointer', padding: '10px', width: 'fit-content'
                        }}
                    >
                        <Plus size={18} /> Add New Badge
                    </button>
                </div>
            </div>
        </div>
    );
}
