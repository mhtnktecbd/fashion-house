"use client";

import { useState, useEffect } from 'react';
import styles from './ProductForm.module.css';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function ProductForm({ product, onSave, onCancel }) {
    // Helper to init form
    const initializeFormData = (p) => {
        if (!p) return {
            title: '', category: 'Men', price: '', originalPrice: '', description: '', image: '', status: 'Published',
            sizeRequired: true, colorRequired: false, sizes: {}, colors: [], variantStock: {},
            showOnHome: false, homeGroup: 'new', homePriority: 100,
            returnInfo: { title: 'Easy Returns & Exchange', bullets: [{ icon: 'check', text: 'Tell us within 3 days' }, { icon: 'truck', text: 'Free return shipping*' }, { icon: 'check', text: 'Instant refund on receipt' }], note: '*Conditions apply' },
            sizeChart: { enabled: false, defaultUnit: 'INCH', columns: ['Chest (round)', 'Length', 'Sleeve'], rows: [{ size: 'M', 'Chest (round)': 39, 'Length': 27.5, 'Sleeve': 8.5 }, { size: 'L', 'Chest (round)': 40.5, 'Length': 28, 'Sleeve': 8.75 }, { size: 'XL', 'Chest (round)': 43, 'Length': 29, 'Sleeve': 9 }] },
            categorySlug: '', subcategorySlug: ''
        };

        const sizeObj = {};
        if (Array.isArray(p.sizes)) { p.sizes.forEach(s => { sizeObj[s] = 0; }); }
        else if (p.sizes && typeof p.sizes === 'object') { Object.assign(sizeObj, p.sizes); }

        let colors = [];
        if (p.colors && Array.isArray(p.colors)) { colors = p.colors; }
        else if (p.colors && typeof p.colors === 'string') { try { colors = JSON.parse(p.colors); } catch (e) { } }

        let variantStock = {};
        if (p.variantStock) {
            if (typeof p.variantStock === 'string') { try { variantStock = JSON.parse(p.variantStock); } catch (e) { } }
            else { variantStock = p.variantStock; }
        }

        let returnInfo = { title: 'Easy Returns & Exchange', bullets: [{ icon: 'check', text: 'Tell us within 3 days' }, { icon: 'truck', text: 'Free return shipping*' }, { icon: 'check', text: 'Instant refund on receipt' }], note: '*Conditions apply' };
        if (p.returnInfo) {
            if (typeof p.returnInfo === 'string') { try { returnInfo = JSON.parse(p.returnInfo); } catch (e) { } }
            else { returnInfo = p.returnInfo; }
        }

        let sizeChart = { enabled: false, defaultUnit: 'INCH', columns: ['Chest (round)', 'Length', 'Sleeve'], rows: [{ size: 'M', 'Chest (round)': 39, 'Length': 27.5, 'Sleeve': 8.5 }, { size: 'L', 'Chest (round)': 40.5, 'Length': 28, 'Sleeve': 8.75 }, { size: 'XL', 'Chest (round)': 43, 'Length': 29, 'Sleeve': 9 }] };
        if (p.sizeChart) {
            if (typeof p.sizeChart === 'string') { try { sizeChart = JSON.parse(p.sizeChart); } catch (e) { } }
            else { sizeChart = p.sizeChart; }
        }

        return {
            title: p.title || '',
            category: p.category || 'Men',
            price: p.price || '',
            originalPrice: p.originalPrice || '',
            description: p.description || '',
            image: p.image || '',
            status: p.status || 'Published',
            sizeRequired: p.sizeRequired !== undefined ? p.sizeRequired : true,
            colorRequired: p.colorRequired !== undefined ? p.colorRequired : false,
            sizes: sizeObj,
            colors: colors,
            variantStock: variantStock,
            returnInfo: returnInfo,
            sizeChart: sizeChart,
            showOnHome: p.showOnHome || false,
            homeGroup: p.homeGroup || 'new',
            homePriority: p.homePriority || 100,
            categorySlug: p.categorySlug || (p.category ? p.category.toLowerCase() : ''),
            subcategorySlug: p.subcategorySlug || ''
        };
    };

    const [formData, setFormData] = useState(() => initializeFormData(product));
    const [prevProduct, setPrevProduct] = useState(product);

    if (product !== prevProduct) {
        setPrevProduct(product);
        setFormData(initializeFormData(product));
    }

    // --- Dynamic Category Logic ---
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('/api/admin/categories')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCategories(data.categories || []);
                }
            })
            .catch(err => console.error("Failed to load categories:", err));
    }, []);

    const selectedCategory = categories.find(c =>
        (c.slug === formData.categorySlug) ||
        (!formData.categorySlug && c.name === formData.category) // Backward compat
    );

    const subCats = selectedCategory?.subCategories || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.price || !formData.image) {
            alert("অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
            return;
        }

        const sizesArray = Object.keys(formData.sizes);
        // Note: sizeStock is legacy, but we can populate it for backward compat if needed.
        // We really rely on variantStock now.
        const sizeStock = formData.sizes;

        const dataToSave = {
            ...formData,
            sizes: sizesArray,
            sizeStock: JSON.stringify(sizeStock), // Legacy backup
            colors: JSON.stringify(formData.colors),
            variantStock: JSON.stringify(formData.variantStock),
            returnInfo: JSON.stringify(formData.returnInfo),
            sizeChart: JSON.stringify(formData.sizeChart),
            categorySlug: formData.categorySlug,
            subcategorySlug: formData.subcategorySlug || null
        };

        onSave(dataToSave);
    };

    // --- VARIANT LOGIC ---

    const handleVariantStockChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            variantStock: {
                ...prev.variantStock,
                [key]: parseInt(value) || 0
            }
        }));
    };

    // Helper to get array of active sizes
    const activeSizes = Object.keys(formData.sizes);

    // Color Handling
    const handleColorAdd = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newColor = e.target.value.trim();
            if (!formData.colors.includes(newColor)) {
                setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
            }
            e.target.value = '';
        }
    };

    const removeColor = (color) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.filter(c => c !== color)
        }));
    };

    // Return Info Handlers (Same as before)
    const handleReturnInfoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            returnInfo: { ...prev.returnInfo, [field]: value }
        }));
    };

    const addReturnBullet = () => {
        setFormData(prev => ({
            ...prev,
            returnInfo: {
                ...prev.returnInfo,
                bullets: [...prev.returnInfo.bullets, { icon: 'check', text: '' }]
            }
        }));
    };

    const updateReturnBullet = (index, field, value) => {
        setFormData(prev => {
            const newBullets = [...prev.returnInfo.bullets];
            newBullets[index] = { ...newBullets[index], [field]: value };
            return {
                ...prev,
                returnInfo: { ...prev.returnInfo, bullets: newBullets }
            };
        });
    };

    const removeReturnBullet = (index) => {
        setFormData(prev => {
            const newBullets = prev.returnInfo.bullets.filter((_, i) => i !== index);
            return {
                ...prev,
                returnInfo: { ...prev.returnInfo, bullets: newBullets }
            };
        });
    };

    // Size Chart Handlers (Same as before)
    const handleSizeChartToggle = (e) => {
        setFormData(prev => ({
            ...prev,
            sizeChart: { ...prev.sizeChart, enabled: e.target.checked }
        }));
    };

    const handleSizeChartUnitChange = (unit) => {
        setFormData(prev => ({
            ...prev,
            sizeChart: { ...prev.sizeChart, defaultUnit: unit }
        }));
    };

    const addSizeChartRow = () => {
        setFormData(prev => ({
            ...prev,
            sizeChart: {
                ...prev.sizeChart,
                rows: [...prev.sizeChart.rows, { size: '', 'Chest (round)': 0, 'Length': 0, 'Sleeve': 0 }]
            }
        }));
    };

    const updateSizeChartRow = (index, field, value) => {
        setFormData(prev => {
            const newRows = [...prev.sizeChart.rows];
            newRows[index] = { ...newRows[index], [field]: value };
            return {
                ...prev,
                sizeChart: { ...prev.sizeChart, rows: newRows }
            };
        });
    };

    const removeSizeChartRow = (index) => {
        setFormData(prev => {
            const newRows = prev.sizeChart.rows.filter((_, i) => i !== index);
            return {
                ...prev,
                sizeChart: { ...prev.sizeChart, rows: newRows }
            };
        });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid}>
                <div className={styles.main}>
                    <Input
                        label="Product Name (পন্যের নাম)"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div className={styles.row}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Category (ক্যাটাগরি)</label>
                            <select
                                className={styles.select}
                                value={formData.categorySlug || ''}
                                onChange={(e) => {
                                    const slug = e.target.value;
                                    const cat = categories.find(c => c.slug === slug);
                                    setFormData(prev => ({
                                        ...prev,
                                        category: cat ? cat.name : '',
                                        categorySlug: slug,
                                        subcategorySlug: ''
                                    }));
                                }}
                                required
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Status</label>
                            <select
                                className={styles.select}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label} style={{ opacity: subCats.length > 0 ? 1 : 0.6 }}>
                                Sub Category (সাব-ক্যাটাগরি)
                            </label>
                            <select
                                className={styles.select}
                                value={formData.subcategorySlug || ''}
                                onChange={(e) => setFormData({ ...formData, subcategorySlug: e.target.value })}
                                disabled={subCats.length === 0}
                                style={{
                                    cursor: subCats.length === 0 ? 'not-allowed' : 'pointer',
                                    opacity: subCats.length === 0 ? 0.6 : 1
                                }}
                            >
                                <option value="">Select Sub Category</option>
                                {subCats.map(sub => (
                                    <option key={sub.id} value={sub.slug}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}></div>
                    </div>

                    <div className={styles.row}>
                        <Input
                            label="Price (৳)"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            required
                        />
                        <Input
                            label="Discount Price (৳) - Optional"
                            type="number"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                        />
                    </div>

                    <div className={styles.textareaGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="4"
                        ></textarea>
                    </div>

                    {/* --- SIZE & COLOR CONFIGURATION --- */}
                    <div className={styles.sizeSection}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                            <h3 className={styles.label} style={{ fontSize: '15px', color: '#fff', margin: 0 }}>Size & Color Configuration</h3>
                        </div>

                        {/* Size Config */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className={styles.label}>Available Sizes</label>
                                <label className={styles.toggle}>
                                    <span style={{ fontSize: '12px', marginRight: '8px', color: '#aaa' }}>Size Required</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.sizeRequired}
                                        onChange={(e) => setFormData({ ...formData, sizeRequired: e.target.checked })}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['S', 'M', 'L', 'XL', 'XXL', 'FREE'].map(size => (
                                    <label key={size} className={`${styles.checkTile} ${formData.sizes[size] !== undefined ? styles.active : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.sizes[size] !== undefined}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData(prev => ({ ...prev, sizes: { ...prev.sizes, [size]: 0 } }));
                                                } else {
                                                    const newSizes = { ...formData.sizes };
                                                    delete newSizes[size];
                                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                                }
                                            }}
                                            hidden
                                        />
                                        {size}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Color Config */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className={styles.label}>Colors</label>
                                <label className={styles.toggle}>
                                    <span style={{ fontSize: '12px', marginRight: '8px', color: '#aaa' }}>Color Required</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.colorRequired}
                                        onChange={(e) => setFormData({ ...formData, colorRequired: e.target.checked })}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px', minHeight: '32px' }}>
                                {formData.colors.map(c => (
                                    <span key={c} style={{ background: '#333', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #444' }}>
                                        {c}
                                        <button type="button" onClick={() => removeColor(c)} style={{ border: 'none', background: 'none', color: '#ff5555', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <Input placeholder="Type color name and hit Enter (e.g. Red)" onKeyDown={handleColorAdd} />
                        </div>

                        {/* Inventory Matrix */}
                        {(activeSizes.length > 0) && (
                            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                                <label className={styles.label} style={{ marginBottom: '12px', display: 'block' }}>Inventory Stock</label>

                                {formData.colors.length > 0 ? (
                                    // Matrix: Size x Color
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '8px', color: '#888', borderBottom: '1px solid #444' }}>Size \ Color</th>
                                                {formData.colors.map(c => <th key={c} style={{ padding: '8px', color: '#ccc', borderBottom: '1px solid #444' }}>{c}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeSizes.map(size => (
                                                <tr key={size}>
                                                    <td style={{ padding: '12px 8px', fontWeight: 'bold', borderBottom: '1px solid #333' }}>{size}</td>
                                                    {formData.colors.map(color => {
                                                        const key = `${size}:${color}`;
                                                        return (
                                                            <td key={key} style={{ padding: '8px', borderBottom: '1px solid #333', textAlign: 'center' }}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={formData.variantStock[key] !== undefined ? formData.variantStock[key] : 0}
                                                                    onChange={(e) => handleVariantStockChange(key, e.target.value)}
                                                                    style={{ width: '70px', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    // List: Size Only (Color = 'Default')
                                    <div className={styles.sizeGrid}>
                                        {activeSizes.map(size => {
                                            const key = `${size}:Default`; // Default color key for no-color products
                                            // Fallback: check if we have data in sizes obj (legacy) or variantStock
                                            const val = formData.variantStock[key] !== undefined
                                                ? formData.variantStock[key]
                                                : (formData.sizes[size] || 0);

                                            return (
                                                <div key={size} style={{ marginBottom: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '13px' }}>{size}</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={val}
                                                        onChange={(e) => {
                                                            const newVal = e.target.value;
                                                            // Update both for safety/legacy compat
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sizes: { ...prev.sizes, [size]: parseInt(newVal) || 0 },
                                                                variantStock: { ...prev.variantStock, [key]: parseInt(newVal) || 0 }
                                                            }));
                                                        }}
                                                        min="0"
                                                        className={styles.input}
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '24px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '30px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff' }}>Homepage Display</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>Feature this product on the main page</p>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={formData.showOnHome}
                                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        {formData.showOnHome && (
                            <div className={styles.row} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.label} style={{ color: '#2dd4bf' }}>Display Group</label>
                                    <select
                                        className={styles.select}
                                        value={formData.homeGroup}
                                        onChange={(e) => setFormData({ ...formData, homeGroup: e.target.value })}
                                        style={{ border: '1px solid rgba(45, 212, 191, 0.3)' }}
                                    >
                                        <option value="new">New Arrivals</option>
                                        <option value="featured">Featured Collection</option>
                                        <option value="bestseller">Best Sellers</option>
                                        <option value="trending">Trending Now</option>
                                    </select>
                                </div>
                                <div style={{ width: '120px' }}>
                                    <label className={styles.label} style={{ color: '#2dd4bf' }}>Priority</label>
                                    <input
                                        type="number"
                                        className={styles.select}
                                        value={formData.homePriority}
                                        onChange={(e) => setFormData({ ...formData, homePriority: Number(e.target.value) })}
                                        placeholder="100"
                                        style={{ border: '1px solid rgba(45, 212, 191, 0.3)' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.section}>
                        <label className={styles.label}>Return & Exchange Info</label>
                        <Input
                            label="Title"
                            value={formData.returnInfo.title}
                            onChange={(e) => handleReturnInfoChange('title', e.target.value)}
                            placeholder="Easy Returns & Exchange"
                        />
                        <div style={{ marginTop: '12px' }}>
                            <label className={styles.label}>Bullets</label>
                            {formData.returnInfo.bullets.map((bullet, index) => (
                                <div key={index} className={styles.bulletRow}>
                                    <select
                                        value={bullet.icon}
                                        onChange={(e) => updateReturnBullet(index, 'icon', e.target.value)}
                                        className={styles.iconSelect}
                                    >
                                        <option value="check">✓ Check</option>
                                        <option value="shield">🛡️ Shield</option>
                                        <option value="truck">🚚 Truck</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={bullet.text}
                                        onChange={(e) => updateReturnBullet(index, 'text', e.target.value)}
                                        placeholder="Bullet text"
                                        className={styles.bulletInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeReturnBullet(index)}
                                        className={styles.removeBtn}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addReturnBullet} className={styles.addBtn}>
                                + Add Bullet
                            </button>
                        </div>
                        <Input
                            label="Note (Optional)"
                            value={formData.returnInfo.note}
                            onChange={(e) => handleReturnInfoChange('note', e.target.value)}
                            placeholder="*Conditions apply"
                        />
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <label className={styles.label}>Size Chart</label>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={formData.sizeChart.enabled}
                                    onChange={handleSizeChartToggle}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        {formData.sizeChart.enabled && (
                            <>
                                <div className={styles.unitTabs}>
                                    <button
                                        type="button"
                                        className={formData.sizeChart.defaultUnit === 'INCH' ? styles.unitTabActive : styles.unitTab}
                                        onClick={() => handleSizeChartUnitChange('INCH')}
                                    >
                                        INCH
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.sizeChart.defaultUnit === 'CM' ? styles.unitTabActive : styles.unitTab}
                                        onClick={() => handleSizeChartUnitChange('CM')}
                                    >
                                        CM
                                    </button>
                                </div>

                                <div className={styles.tableEditor}>
                                    <table className={styles.chartTable}>
                                        <thead>
                                            <tr>
                                                <th>Size</th>
                                                {formData.sizeChart.columns.map((col, i) => (
                                                    <th key={i}>{col}</th>
                                                ))}
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.sizeChart.rows.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.size}
                                                            onChange={(e) => updateSizeChartRow(rowIndex, 'size', e.target.value)}
                                                            placeholder="M"
                                                            className={styles.chartInput}
                                                        />
                                                    </td>
                                                    {formData.sizeChart.columns.map((col, colIndex) => (
                                                        <td key={colIndex}>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={row[col] || 0}
                                                                onChange={(e) => updateSizeChartRow(rowIndex, col, e.target.value)}
                                                                className={styles.chartInput}
                                                            />
                                                        </td>
                                                    ))}
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSizeChartRow(rowIndex)}
                                                            className={styles.removeBtn}
                                                        >
                                                            ×
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button type="button" onClick={addSizeChartRow} className={styles.addBtn}>
                                        + Add Row
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <Input
                        label="Image URL"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        required
                        placeholder="https://example.com/image.jpg"
                    />
                    {formData.image && (
                        <div className={styles.preview}>
                            <img src={formData.image} alt="Preview" />
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.footer}>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Product</Button>
            </div>
        </form>
    );
}
