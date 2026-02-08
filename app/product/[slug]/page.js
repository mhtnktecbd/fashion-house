"use client";

import { useFeatures } from '@/app/providers';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import Button from '@/components/Button';
import ActionButton from '@/components/ActionButton';
import QuantityStepper from '@/components/QuantityStepper';
import ReturnInfoBox from '@/components/ReturnInfoBox';
import SizeChart from '@/components/SizeChart';
import ProductImageGallery from '@/components/ProductImageGallery'; // NEW
import { Heart, Ruler } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';
import styles from './product.module.css';
import { use, useState } from 'react';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import SizeGuideModal from '@/components/SizeGuideModal';
import TrustBadgeRow from '@/components/TrustBadgeRow';
import RelatedProducts from '@/components/RelatedProducts';
import StickyAddToCart from '@/components/StickyAddToCart'; // NEW // NEW

export default function ProductPage({ params }) {
    const { slug } = use(params);
    const router = useRouter();
    const features = useFeatures();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { products, isLoaded } = useProducts();

    // Find product from context
    const product = products.find(p => p.slug === slug);

    // State management
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [reviewTrigger, setReviewTrigger] = useState(0);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [error, setError] = useState(''); // For validation errors

    // --- Parsing Logic ---

    // Sizes
    let availableSizes = [];
    if (product?.availableSizes) {
        if (Array.isArray(product.availableSizes)) availableSizes = product.availableSizes;
        else try { availableSizes = JSON.parse(product.availableSizes); } catch (e) { }
    } else if (product?.sizes) {
        // Legacy sizes
        if (Array.isArray(product.sizes)) availableSizes = product.sizes;
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
        if (!product) return 0;

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

    // Initial Quantity Reset on Option Change
    if (quantity > maxQuantity && maxQuantity > 0) {
        setQuantity(maxQuantity);
    } else if (maxQuantity > 0 && quantity === 0) {
        setQuantity(1);
    }

    // Is Variant OOS for UI disabling
    const isVariantRefOutStrict = (s, c) => {
        const checkSize = s || "FREE";
        const checkColor = c || "Default";
        // If we have variant stock, check specific key
        if (Object.keys(variantStock).length > 0) {
            const key = `${checkSize}:${checkColor}`;
            // If key exists and is 0, it's OOS. 
            // If key doesn't exist, assume 0 for safety if using matrix behavior? 
            // Or assume valid? Let's assume 0 if explicit matrix exists but key missing.
            return (variantStock[key] || 0) === 0;
        }
        // Fallback
        if (sizeStock && sizeStock[checkSize] !== undefined) {
            return sizeStock[checkSize] === 0;
        }
        return false;
    };

    // Handle Add to Cart
    const handleAddToCart = () => {
        if (!product) return;
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
            setError('Selected quantity not available');
            return;
        }

        const cartItem = {
            ...product,
            size: selectedSize || (availableSizes.length > 0 ? null : "FREE"),
            color: selectedColor || "Default",
            quantity: quantity,
            maxStock: maxQuantity // Pass max stock
        };

        addToCart(cartItem);
    };

    const handleBuyNow = () => {
        if (!product) return;
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
            setError('Selected quantity not available');
            return;
        }

        const cartItem = {
            ...product,
            size: selectedSize || (availableSizes.length > 0 ? null : "FREE"),
            color: selectedColor || "Default",
            quantity: quantity,
            maxStock: maxQuantity
        };

        addToCart(cartItem, false);
        router.push('/checkout');
    };

    if (!features || !isLoaded) {
        return <><div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading...</div></>;
    }
    if (!product) {
        return <><div className="container" style={{ padding: '100px 0', textAlign: 'center' }}><h1>Product Not Found</h1></div></>;
    }

    return (
        <>
            <div className="container">
                <div className={styles.grid}>
                    {/* Gallery */}
                    <ProductImageGallery product={product} />

                    {/* Info */}
                    <div className={styles.info}>
                        <h1 className={styles.title}>{product.title}</h1>
                        <div className={styles.price}>৳{product.price}</div>

                        {/* Size Selector */}
                        {availableSizes.length > 0 && (
                            <div className={styles.optionGroup}>
                                <div className={styles.labelRow}>
                                    <span className={styles.optionLabel}>Select Size {isSizeRequired && <span style={{ color: 'red' }}>*</span>}</span>
                                    <button
                                        className={styles.sizeGuideBtn}
                                        onClick={() => setIsSizeGuideOpen(true)}
                                        type="button"
                                    >
                                        <Ruler size={14} /> Size Guide
                                    </button>
                                </div>
                                <div className={styles.sizes}>
                                    {availableSizes.map(s => {
                                        // Check OOS based on CURRENT selected color (if any)
                                        // If no color selected yet, check if ALL variants of this size are OOS? 
                                        // For now, simple check: if color selected, check specific. If not, check legacy or default.
                                        const oos = selectedColor ? isVariantRefOutStrict(s, selectedColor) : false;
                                        return (
                                            <button
                                                key={s}
                                                className={`${styles.sizeBtn} ${selectedSize === s ? styles.sizeBtnActive : ''} ${oos ? styles.sizeBtnDisabled : ''}`}
                                                onClick={() => {
                                                    if (!oos) {
                                                        setSelectedSize(s);
                                                        setError('');
                                                    }
                                                }}
                                                disabled={oos}
                                                type="button"
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Color Selector */}
                        {colors.length > 0 && (
                            <div className={styles.section}>
                                <label className={styles.label}>Color {isColorRequired && <span style={{ color: 'red' }}>*</span>}</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {colors.map(c => {
                                        // Check OOS based on CURRENT selected size (if any)
                                        const oos = selectedSize ? isVariantRefOutStrict(selectedSize, c) : false;
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                className={`${styles.colorBtn} ${selectedColor === c ? styles.colorBtnActive : ''}`}
                                                onClick={() => {
                                                    if (!oos) {
                                                        setSelectedColor(c);
                                                        setError('');
                                                    }
                                                }}
                                                disabled={oos}
                                            >
                                                {c}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Validation Error Message */}
                        {error && (
                            <div style={{ color: '#e00', marginBottom: '10px', fontWeight: '500' }}>
                                {error}
                            </div>
                        )}

                        {/* Quantity Stepper */}
                        {maxQuantity > 0 ? (
                            <div className={styles.section}>
                                <label className={styles.label}>Quantity</label>
                                <QuantityStepper
                                    value={quantity}
                                    onChange={setQuantity}
                                    min={1}
                                    max={maxQuantity}
                                />
                                {maxQuantity <= 3 && (
                                    <p style={{ color: 'red', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>
                                        Only {maxQuantity} left!
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div style={{ color: 'red', fontWeight: 'bold', margin: '20px 0' }}>Out of Stock</div>
                        )}

                        {/* Action Buttons */}
                        <div className={styles.actions}>
                            {/* Row 1: Add to Cart + Wishlist */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <ActionButton
                                        onClick={handleAddToCart}
                                        disabled={maxQuantity === 0}
                                        type="button"
                                        variant="solid"
                                        fullWidth={true}
                                    >
                                        {maxQuantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                                    </ActionButton>
                                </div>
                                <button
                                    className={styles.wishlistBtn}
                                    onClick={() => toggleWishlist(product)}
                                    title={isInWishlist(product?.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                >
                                    <Heart
                                        size={24}
                                        fill={isInWishlist(product?.id) ? "currentColor" : "none"}
                                        color={isInWishlist(product?.id) ? "#e91e63" : "currentColor"}
                                    />
                                </button>
                            </div>

                            {/* Row 2: Buy Now */}
                            {maxQuantity > 0 && (
                                <div style={{ width: '100%', marginTop: '12px' }}>
                                    <ActionButton
                                        variant="outline"
                                        onClick={handleBuyNow}
                                        type="button"
                                        fullWidth={true}
                                    >
                                        BUY NOW
                                    </ActionButton>
                                </div>
                            )}

                            {/* WhatsApp */}
                            {features.whatsapp_button && (
                                <Button fullWidth style={{ borderColor: '#25D366', color: '#25D366', marginTop: '12px' }}>Order on WhatsApp</Button>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <TrustBadgeRow />

                        {/* Description */}
                        <div className={styles.description}>
                            <p>{product.description}</p>
                        </div>

                        {/* Return Info Box */}
                        {product.returnInfo && <ReturnInfoBox returnInfo={product.returnInfo} />}

                        {/* Size Chart */}
                        {product.sizeChart && <SizeChart sizeChart={product.sizeChart} />}

                        {/* Legacy Return Policy */}
                        {features.return_system && !product.returnInfo && (
                            <div className={styles.policy}>
                                🛡️ ডেলিভারি পাওয়ার ৭২ ঘন্টার মধ্যে রিটার্ন/রিফান্ড রিকোয়েস্ট করা যাবে।
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {product && <RelatedProducts currentProductId={product.id} category={product.category} />}

                {/* Reviews Section */}
                <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
                    <ReviewList productSlug={product.slug} refreshTrigger={reviewTrigger} />
                    <ReviewForm productSlug={product.slug} onReviewSubmitted={() => setReviewTrigger(prev => prev + 1)} />
                </div>
            </div>
            {/* Size Guide Modal */}
            <SizeGuideModal
                isOpen={isSizeGuideOpen}
                onClose={() => setIsSizeGuideOpen(false)}
            />
            {product && (
                <StickyAddToCart
                    product={product}
                    selectedSize={selectedSize}
                    price={product.price}
                    valid={!!selectedSize || !product.sizes || product.sizes.length === 0}
                    onAddToCart={() => {
                        if ((!product.sizes || product.sizes.length > 0) && !selectedSize) {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                            handleAddToCart();
                        }
                    }}
                />
            )}
        </>
    );
}
