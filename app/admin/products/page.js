"use client";

import { useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import styles from '../admin.module.css';
import ProductForm from '@/components/admin/ProductForm';
import { adminEn } from '@/lib/i18n/admin.en';

export default function AdminProductsPage() {
    const { products, isLoaded, addProduct, updateProduct, deleteProduct, toggleStatus } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = (formData) => {
        if (editingProduct) {
            updateProduct(editingProduct.id, formData);
            showToast("Product updated successfully!");
        } else {
            addProduct(formData);
            showToast("New product added successfully!");
        }
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteProduct(id);
            showToast("Product deleted.");
        }
    };

    const handleEdit = (p) => {
        setEditingProduct(p);
        setIsModalOpen(true);
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>{adminEn.products.title} Management</h1>
                <button
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    style={{
                        padding: '12px 24px',
                        background: 'var(--accent)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        boxShadow: '0 0 20px rgba(45, 212, 191, 0.3)',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    + {adminEn.products.addNew}
                </button>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '30px',
                    right: '30px',
                    background: 'rgba(45, 212, 191, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: '#000',
                    padding: '16px 30px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    zIndex: 2000,
                    fontWeight: '700'
                }}>
                    ✅ {toast}
                </div>
            )}

            <div className={styles.card} style={{ padding: '0 10px' }}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)' }}>
                                            <img src={product.image || 'https://via.placeholder.com/48'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-on-card)' }}>{product.title}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ID: {product.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{product.category}</td>
                                <td style={{ color: 'var(--accent)', fontWeight: '800' }}>৳{product.price}</td>
                                <td>
                                    <button
                                        onClick={() => toggleStatus(product.id)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '10px',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            background: product.status === 'Published' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: product.status === 'Published' ? '#2dd4bf' : '#f59e0b'
                                        }}
                                    >
                                        {product.status || 'Published'}
                                    </button>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleEdit(product)}
                                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '15px', fontSize: '14px', fontWeight: '700' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#1a1a1a',
                        border: '1px solid var(--card-border)',
                        borderRadius: '28px',
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '40px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                        animation: 'pageEnter 0.4s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '800' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', width: '40px', height: '40px', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                &times;
                            </button>
                        </div>
                        <ProductForm
                            product={editingProduct}
                            onSave={handleSave}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
