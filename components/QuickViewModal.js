"use client";

import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check } from 'lucide-react';
import styles from './QuickViewModal.module.css';

// Sub-component that holds the form state
function QuickViewContent({ product }) {
    const { closeQuickView, openCart } = useUI();
    const { addToCart } = useCart();

    // Form State (No need for reset effect because we rely on key remount)
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    // --- Parsing Logic (Mirrors ProductPage) ---

    // Sizes
    let availableSizes = [];
    if (product?.availableSizes) {
        if (Array.isArray(product.availableSizes)) availableSizes = product.availableSizes;
        else try { availableSizes = JSON.parse(product.availableSizes); } catch (e) { }
    } else if (product?.sizes) {
        // Legacy sizes
        if (Array.isArray(product.sizes)) availableSizes = product.sizes;
        else if (typeof product.sizes === 'object') availableSizes = Object.keys(product.sizes);
    }

    // Colors
    let colors = [];
    if (product?.colors) {
        if (Array.isArray(product.colors)) colors = product.colors;
        else if (typeof product.colors === 'string') {
            try { colors = JSON.parse(product.colors); } catch (e) { }
        }
    }

    // Variant Stock
    let variantStock = {};
    if (product?.variantStock) {
        if (typeof product.variantStock === 'object') variantStock = product.variantStock;
        else if (typeof product.variantStock === 'string') {
            try { variantStock = JSON.parse(product.variantStock); } catch (e) { }
        }
    }

    // Legacy Size Stock
    let sizeStock = {};
    if (product?.sizeStock) {
        if (typeof product.sizeStock === 'object') sizeStock = product.sizeStock;
        else try { sizeStock = JSON.parse(product.sizeStock); } catch (e) { }
    }

    // Requirements
    const isSizeRequired = product?.sizeRequired !== false && availableSizes.length > 0;
    const isColorRequired = product?.colorRequired === true && colors.length > 0;

    // --- Stock Logic ---

    const getCurrentStock = (size, color) => {
        let stock = 0;
        const sizeKey = size || "FREE";
        const colorKey = color || "Default";

        // 1. Variant Stock Check
        if (Object.keys(variantStock).length > 0) {
            const key = `${sizeKey}:${colorKey}`;
            if (variantStock[key] !== undefined) {
                return variantStock[key];
            }
        }

        // 2. Fallback: Size Stock
        if (sizeStock && sizeStock[sizeKey] !== undefined) {
            return sizeStock[sizeKey];
        }

        // 3. Fallback: Assumption (if no explicit stock tracked)
        return 100;
    };

    const maxQuantity = getCurrentStock(selectedSize, selectedColor);

    // Is Variant OOS for UI
    const isVariantRefOutStrict = (s, c) => {
        const checkSize = s || "FREE";
        const checkColor = c || "Default";
        if (Object.keys(variantStock).length > 0) {
            const key = `${checkSize}:${checkColor}`;
            return (variantStock[key] || 0) === 0;
        }
        if (sizeStock && sizeStock[checkSize] !== undefined) {
            return sizeStock[checkSize] === 0;
        }
        return false;
    };


    const handleAddToCart = () => {
        setError('');

        // Validation
        if (isSizeRequired && !selectedSize) {
            setError('Please select a size');
            return;
        }
        if (isColorRequired && !selectedColor) {
            setError('Please select a color');
            return;
        }
        if (maxQuantity === 0) {
            setError('Selected combination is Out of Stock');
            return;
        }

        addToCart({
            ...product,
            size: selectedSize || (availableSizes.length > 0 ? null : "FREE"),
            color: selectedColor || "Default",
            quantity,
            maxStock: maxQuantity
        });

        closeQuickView();
        openCart(); // Auto open drawer
    };

    return (
        <div className={styles.overlay} onClick={closeQuickView}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={closeQuickView}><X size={24} /></button>

                <div className={styles.grid}>
                    {/* Image */}
                    <div className={styles.imageCol}>
                        <div className={styles.imageWrapper}>
                            <Image
                                src={product.image || '/placeholder.svg'}
                                alt={product.title}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className={styles.detailsCol}>
                        <h2 className={styles.title}>{product.title}</h2>
                        <div className={styles.priceRow}>
                            <span className={styles.price}>৳{product.price}</span>
                            {product.originalPrice && <span className={styles.oldPrice}>৳{product.originalPrice}</span>}
                        </div>

                        {/* Size Selector */}
                        {availableSizes.length > 0 && (
                            <div className={styles.optionGroup}>
                                <div className={styles.label}>Size: <span style={{ fontWeight: 600 }}>{selectedSize || 'Select'}</span> {isSizeRequired && <span style={{ color: 'red' }}>*</span>}</div>
                                <div className={styles.options}>
                                    {availableSizes.map(size => {
                                        const oos = selectedColor ? isVariantRefOutStrict(size, selectedColor) : false;
                                        return (
                                            <button
                                                key={size}
                                                className={`${styles.optionBtn} ${selectedSize === size ? styles.selected : ''}`}
                                                onClick={() => {
                                                    if (!oos) {
                                                        setSelectedSize(size);
                                                        setError('');
                                                    }
                                                }}
                                                disabled={oos}
                                                style={oos ? { opacity: 0.5, cursor: 'not-allowed', textDecoration: 'line-through' } : {}}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Color Selector */}
                        {colors.length > 0 && (
                            <div className={styles.optionGroup}>
                                <div className={styles.label}>Color: <span style={{ fontWeight: 600 }}>{selectedColor || 'Select'}</span> {isColorRequired && <span style={{ color: 'red' }}>*</span>}</div>
                                <div className={styles.options}>
                                    {colors.map(color => {
                                        const oos = selectedSize ? isVariantRefOutStrict(selectedSize, color) : false;
                                        return (
                                            <button
                                                key={color}
                                                className={`${styles.optionBtn} ${selectedColor === color ? styles.selected : ''}`}
                                                onClick={() => {
                                                    if (!oos) {
                                                        setSelectedColor(color);
                                                        setError('');
                                                    }
                                                }}
                                                disabled={oos}
                                                style={oos ? { opacity: 0.5, cursor: 'not-allowed', textDecoration: 'line-through' } : {}}
                                            >
                                                {color}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className={styles.optionGroup}>
                            <div className={styles.label}>Quantity</div>
                            <div className={styles.qtyWrapper}>
                                <div className={styles.qtyControl}>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >-</button>
                                    <span className={styles.qtyValue}>{quantity}</span>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => setQuantity(Math.min(maxQuantity || 99, quantity + 1))}
                                        disabled={quantity >= maxQuantity}
                                    >+</button>
                                </div>
                                <span className={styles.stockStatus}>
                                    {maxQuantity > 0
                                        ? (maxQuantity < 10 ? `Only ${maxQuantity} left!` : 'In Stock')
                                        : 'Out of Stock'
                                    }
                                </span>
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button className={styles.addBtn} onClick={handleAddToCart}>
                            Add to Cart
                        </button>

                        <div className={styles.linkWrapper}>
                            <Link href={`/product/${product.slug}`} className={styles.viewLink} onClick={closeQuickView}>
                                View Full Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QuickViewModal() {
    const { quickViewProduct } = useUI();

    if (!quickViewProduct) return null;

    return <QuickViewContent product={quickViewProduct} key={quickViewProduct.id} />;
}
