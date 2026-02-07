"use client";

import { useState, useEffect } from 'react';
import { Save, Truck, DollarSign, Info, MapPin, Power } from 'lucide-react';
import styles from '../admin.module.css';

export default function ShippingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rules, setRules] = useState({
        enabled: true,
        codEnabled: true,
        insideDhaka: { enabled: true, fee: 70, freeShippingEnabled: false, freeShippingMin: 0 },
        outsideDhaka: { enabled: true, fee: 130, freeShippingEnabled: false, freeShippingMin: 0 }
    });

    useEffect(() => {
        fetch('/api/shipping/rules')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setRules(prev => ({
                        ...prev,
                        ...data,
                        insideDhaka: { ...prev.insideDhaka, ...(data.insideDhaka || {}) },
                        outsideDhaka: { ...prev.outsideDhaka, ...(data.outsideDhaka || {}) }
                    }));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/shipping/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rules)
            });
            if (res.ok) {
                alert('Shipping rules saved successfully!');
            } else {
                alert('Failed to save rules.');
            }
        } catch (error) {
            console.error(error);
            alert('Network error saving rules.');
        } finally {
            setSaving(false);
        }
    };

    const updateInside = (field, value) => {
        setRules(prev => ({
            ...prev,
            insideDhaka: { ...prev.insideDhaka, [field]: value }
        }));
    };

    const updateOutside = (field, value) => {
        setRules(prev => ({
            ...prev,
            outsideDhaka: { ...prev.outsideDhaka, [field]: value }
        }));
    };

    if (loading) return <div style={{ padding: '50px', color: 'white', textAlign: 'center' }}>Loading configurator...</div>;

    const InputField = ({ label, value, onChange, icon: Icon, disabled }) => (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                {Icon && <Icon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />}
                <input
                    type="number"
                    className={styles.input}
                    value={value}
                    onChange={e => onChange(parseInt(e.target.value) || 0)}
                    disabled={disabled}
                    style={{ paddingLeft: Icon ? '36px' : '12px', width: '100%', background: disabled ? '#f3f4f6' : 'white', opacity: disabled ? 0.7 : 1 }}
                />
            </div>

            <style jsx global>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
        </div>
    );

    const Toggle = ({ label, checked, onChange, disabled, color = '#2dd4bf' }) => (
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: checked ? `${color}15` : 'rgba(0,0,0,0.02)', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer', border: `1px solid ${checked ? color : 'rgba(0,0,0,0.1)'}`, transition: 'all 0.2s' }}>
            <span style={{ fontWeight: '600', fontSize: '14px', color: checked ? color : '#4b5563' }}>{label}</span>
            <div style={{ position: 'relative', width: '44px', height: '24px', background: checked ? color : '#d1d5db', borderRadius: '24px', transition: 'all 0.3s' }}>
                <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transform: checked ? 'translateX(20px)' : 'translateX(0)', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
            <input type="checkbox" checked={checked} onChange={e => !disabled && onChange(e.target.checked)} style={{ display: 'none' }} disabled={disabled} />
        </label>
    );

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.headerRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Truck size={32} color="#2dd4bf" /> Shipping Rules
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '14px' }}>Configure delivery zones, fees, and free shipping thresholds.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '12px 24px',
                        background: '#2dd4bf',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: saving ? 'wait' : 'pointer',
                        boxShadow: '0 0 20px rgba(45, 212, 191, 0.4)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>

                {/* Global Settings */}
                <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}><Power size={20} /></div>
                        <h3 className={styles.cardTitle} style={{ margin: 0 }}>Global Controls</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <Toggle
                            label="Enable Shipping System"
                            checked={rules.enabled}
                            onChange={v => setRules({ ...rules, enabled: v })}
                        />
                        <Toggle
                            label="Cash on Delivery (COD)"
                            checked={rules.codEnabled}
                            onChange={v => setRules({ ...rules, codEnabled: v })}
                        />
                    </div>
                </div>

                {/* Inside Dhaka */}
                <div className={styles.card} style={{ opacity: rules.enabled ? 1 : 0.6, pointerEvents: rules.enabled ? 'auto' : 'none', transition: 'all 0.3s' }}>
                    <div style={{ marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '8px', color: '#059669' }}><MapPin size={18} /></div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Inside Dhaka</h3>
                        </div>
                        <Toggle label={rules.insideDhaka.enabled ? "Active" : "Inactive"} checked={rules.insideDhaka.enabled} onChange={v => updateInside('enabled', v)} color="#10b981" />
                    </div>

                    <div style={{ opacity: rules.insideDhaka.enabled ? 1 : 0.5, transition: 'all 0.3s' }}>
                        <InputField
                            label="Delivery Fee"
                            value={rules.insideDhaka.fee}
                            onChange={v => updateInside('fee', v)}
                            icon={DollarSign}
                            disabled={!rules.insideDhaka.enabled}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <Toggle
                                label="Enable Free Shipping"
                                checked={rules.insideDhaka.freeShippingEnabled}
                                onChange={v => updateInside('freeShippingEnabled', v)}
                                disabled={!rules.insideDhaka.enabled}
                                color="#059669"
                            />
                        </div>

                        {rules.insideDhaka.freeShippingEnabled && (
                            <div style={{ marginTop: '15px', animation: 'fadeIn 0.3s ease-out' }}>
                                <InputField
                                    label="Minimum Order Amount for Free Shipping"
                                    value={rules.insideDhaka.freeShippingMin}
                                    onChange={v => updateInside('freeShippingMin', v)}
                                    icon={DollarSign}
                                    disabled={!rules.insideDhaka.enabled}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Outside Dhaka */}
                <div className={styles.card} style={{ opacity: rules.enabled ? 1 : 0.6, pointerEvents: rules.enabled ? 'auto' : 'none', transition: 'all 0.3s' }}>
                    <div style={{ marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}><Truck size={18} /></div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Outside Dhaka</h3>
                        </div>
                        <Toggle label={rules.outsideDhaka.enabled ? "Active" : "Inactive"} checked={rules.outsideDhaka.enabled} onChange={v => updateOutside('enabled', v)} color="#3b82f6" />
                    </div>

                    <div style={{ opacity: rules.outsideDhaka.enabled ? 1 : 0.5, transition: 'all 0.3s' }}>
                        <InputField
                            label="Delivery Fee"
                            value={rules.outsideDhaka.fee}
                            onChange={v => updateOutside('fee', v)}
                            icon={DollarSign}
                            disabled={!rules.outsideDhaka.enabled}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <Toggle
                                label="Enable Free Shipping"
                                checked={rules.outsideDhaka.freeShippingEnabled}
                                onChange={v => updateOutside('freeShippingEnabled', v)}
                                disabled={!rules.outsideDhaka.enabled}
                                color="#2563eb"
                            />
                        </div>

                        {rules.outsideDhaka.freeShippingEnabled && (
                            <div style={{ marginTop: '15px', animation: 'fadeIn 0.3s ease-out' }}>
                                <InputField
                                    label="Minimum Order Amount for Free Shipping"
                                    value={rules.outsideDhaka.freeShippingMin}
                                    onChange={v => updateOutside('freeShippingMin', v)}
                                    icon={DollarSign}
                                    disabled={!rules.outsideDhaka.enabled}
                                />
                            </div>
                        )}
                    </div>
                </div>

            </div>
            <style jsx global>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
        </div>
    );
}


