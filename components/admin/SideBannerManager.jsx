"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Trash2,
    Edit3,
    Plus,
    ArrowUp,
    ArrowDown,
    Upload,
    Loader2,
    Image as ImageIcon,
    X
} from 'lucide-react';
import styles from '@/app/admin/toggles/toggles.module.css';

export default function SideBannerManager() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        link: '',
        isActive: true,
        order: 0
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/side-banners');

            // Defensive Check: Ensure successful response and JSON content type
            if (!res.ok) {
                // If 404/500, avoid parsing HTML as JSON
                throw new Error(`Server returned ${res.status} ${res.statusText}`);
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Received non-JSON response:", text.slice(0, 100)); // Log for debugging
                throw new Error("Received HTML/non-JSON response from server");
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                setBanners(data.sort((a, b) => a.order - b.order));
            }
        } catch (err) {
            console.error("Failed to fetch banners:", err);
            // Optional: Show toast or UI error state, but here just logging to prevent crash
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData(banner);
        } else {
            setEditingBanner(null);
            setFormData({ title: '', image: '', link: '', isActive: true, order: banners.length });
        }
        setIsModalOpen(true);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append("file", file);
        data.append("folder", "side-banners");

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (result.url) {
                setFormData(prev => ({ ...prev, image: result.url }));
            }
        } catch (error) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingBanner ? 'PUT' : 'POST';
        try {
            const res = await fetch('/api/admin/side-banners', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingBanner ? { ...formData, id: editingBanner.id } : formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            fetchBanners();
            setIsModalOpen(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            await fetch(`/api/admin/side-banners?id=${id}`, { method: 'DELETE' });
            fetchBanners();
        }
    };

    const handleToggle = async (banner) => {
        try {
            await fetch('/api/admin/side-banners', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...banner, isActive: !banner.isActive })
            });
            fetchBanners();
        } catch (err) {
            console.error(err);
        }
    };

    const moveBanner = async (index, direction) => {
        const newBanners = [...banners];
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= newBanners.length) return;

        const tempOrder = newBanners[index].order;
        newBanners[index].order = newBanners[targetIndex].order;
        newBanners[targetIndex].order = tempOrder;

        const sorted = [...newBanners].sort((a, b) => a.order - b.order);
        setBanners(sorted);

        try {
            await Promise.all([
                fetch('/api/admin/side-banners', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: newBanners[index].id, order: newBanners[index].order })
                }),
                fetch('/api/admin/side-banners', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: newBanners[targetIndex].id, order: newBanners[targetIndex].order })
                })
            ]);
        } catch (err) {
            console.error(err);
            fetchBanners();
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-white" size={24} />
        </div>
    );

    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Side Mini Banners</h2>
                    <button
                        onClick={() => handleOpenModal()}
                        className={styles.saveBtn}
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                        <Plus size={16} /> Add Banner
                    </button>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Preview</th>
                                <th>Title & Link</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                                        No banners added yet.
                                    </td>
                                </tr>
                            ) : (
                                banners.map((banner, index) => (
                                    <tr key={banner.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <button onClick={() => moveBanner(index, -1)} disabled={index === 0} className={styles.actionBtn}><ArrowUp size={12} /></button>
                                                    <button onClick={() => moveBanner(index, 1)} disabled={index === banners.length - 1} className={styles.actionBtn}><ArrowDown size={12} /></button>
                                                </div>
                                                <span className="font-bold">{banner.order}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <img src={banner.image || '/placeholder.svg'} alt="" className={styles.thumbnail} />
                                        </td>
                                        <td>
                                            <div className="font-bold text-gray-900">{banner.title}</div>
                                            <div className="text-xs text-gray-400">{banner.link || 'No link'}</div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggle(banner)}
                                                className={`${styles.statusPill} ${banner.isActive ? styles.pillEnabled : styles.pillDisabled}`}
                                            >
                                                {banner.isActive ? 'ENABLED' : 'HIDDEN'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleOpenModal(banner)} className={styles.actionBtn}><Edit3 size={16} /></button>
                                                <button onClick={() => handleDelete(banner.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-[#111] uppercase tracking-tighter">
                                {editingBanner ? 'Edit Banner' : 'New Side Banner'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Banner Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={styles.input}
                                    placeholder="Enter title..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Banner Image</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-video rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-all overflow-hidden"
                                >
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-gray-500" />
                                    ) : formData.image ? (
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400 mb-2" size={24} />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to upload</p>
                                        </>
                                    )}
                                    <input type="file" hidden ref={fileInputRef} onChange={handleUpload} accept="image/*" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Link URL</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className={styles.input}
                                    placeholder="/shop"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-[#111] uppercase tracking-wider">Is Active?</span>
                                <div
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`w-12 h-6 rounded-full cursor-pointer transition-all relative ${formData.isActive ? 'bg-[#10b981]' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98] text-xs"
                            >
                                {editingBanner ? 'Update Banner' : 'Create Banner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
