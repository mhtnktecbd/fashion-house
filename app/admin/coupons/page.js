"use client";

import { useState, useEffect } from 'react';
import {
    Trash2,
    Edit,
    Plus,
    Search,
    Calendar,
    AlertCircle,
    X
} from 'lucide-react';
import styles from './coupons.module.css';

export default function CouponManager() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENT', // PERCENT | FIXED
        value: '',
        minOrder: '',
        maxUses: '',
        expiresAt: '',
        active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/coupons');
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.code.trim()) return "Coupon code is required";
        if (!formData.value || Number(formData.value) <= 0) return "Valid discount value is required";
        if (formData.type === 'PERCENT' && Number(formData.value) > 100) return "Percentage cannot exceed 100%";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationErr = validateForm();
        if (validationErr) {
            setError(validationErr);
            return;
        }

        const method = editing ? 'PUT' : 'POST';
        const payload = editing ? { ...formData, id: editing.id } : formData;

        try {
            const res = await fetch('/api/coupons', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchCoupons();
                setModalOpen(false);
                resetForm();
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to save');
            }
        } catch (error) {
            setError('Network error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchCoupons();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const resetForm = () => {
        setEditing(null);
        setError('');
        setFormData({
            code: '',
            type: 'PERCENT',
            value: '',
            minOrder: '',
            maxUses: '',
            expiresAt: '',
            active: true
        });
    };

    const openEdit = (coupon) => {
        setEditing(coupon);
        setError('');
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrder: coupon.minOrder || '',
            maxUses: coupon.maxUses || '',
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
            active: coupon.active
        });
        setModalOpen(true);
    };

    const handleCodeChange = (e) => {
        setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') });
    };

    const filtered = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Coupon Manager</h1>
                <button
                    className={styles.newButton}
                    onClick={() => { resetForm(); setModalOpen(true); }}
                >
                    <Plus size={18} />
                    New Coupon
                </button>
            </div>

            {/* Search */}
            <div className={styles.searchContainer}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading coupons...</div>
            ) : (
                <div className={styles.card}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Conditions</th>
                                <th>Usage</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        No coupons found
                                    </td>
                                </tr>
                            ) : filtered.map(coupon => (
                                <tr key={coupon.id}>
                                    <td className={styles.codeCell}>{coupon.code}</td>
                                    <td>
                                        <span className={`${styles.discountBadge} ${coupon.type === 'PERCENT' ? styles.badgePercent : styles.badgeFixed}`}>
                                            {coupon.type === 'PERCENT' ? `${coupon.value}% OFF` : `৳${coupon.value} FLAT`}
                                        </span>
                                    </td>
                                    <td className={styles.conditions}>
                                        {coupon.minOrder > 0 && <div>Min Order: ৳{coupon.minOrder}</div>}
                                        {coupon.expiresAt && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {new Date(coupon.expiresAt).toLocaleDateString()}
                                        </div>}
                                        {!coupon.minOrder && !coupon.expiresAt && 'No conditions'}
                                    </td>
                                    <td className={styles.usage}>
                                        {coupon.usedCount} <span style={{ color: '#94a3b8' }}>/ {coupon.maxUses || '∞'}</span>
                                    </td>
                                    <td>
                                        {coupon.active ? (
                                            <span className={styles.statusActive}>Active</span>
                                        ) : (
                                            <span className={styles.statusInactive}>Inactive</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => openEdit(coupon)}
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
                    <div className={styles.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h2 className={styles.modalTitle}>{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {error && (
                            <div className={styles.validationError}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Coupon Code</label>
                                <input
                                    className={styles.input}
                                    value={formData.code}
                                    onChange={handleCodeChange}
                                    required
                                    placeholder="Ex: WINTER20"
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.label}>Type</label>
                                    <select
                                        className={styles.select}
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="PERCENT">Percentage (%)</option>
                                        <option value="FIXED">Flat Amount (৳)</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.label}>Value</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.label}>Min Order (Optional)</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        value={formData.minOrder}
                                        onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.label}>Max Uses (Optional)</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        placeholder="∞"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Expiry Date (Optional)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className={styles.input}
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    />
                                    <Calendar className={styles.searchIcon} style={{ left: 'auto', right: '14px', pointerEvents: 'none' }} size={18} />
                                </div>
                            </div>

                            <label className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                                <span className={styles.checkboxLabel}>Active</span>
                            </label>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.createBtn}>
                                    {editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
