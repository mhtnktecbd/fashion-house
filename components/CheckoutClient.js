"use client";

import { useFeatures } from '@/app/providers';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import styles from '@/app/checkout/checkout.module.css';
import en from '@/lib/i18n/en';
import { Tag, X } from 'lucide-react';

export default function CheckoutClient() {
    const features = useFeatures();
    const { data: session } = useSession();
    const { cart, cartTotal, clearCart, updateCartItemVariant } = useCart();
    const router = useRouter();

    const [shippingRules, setShippingRules] = useState(null);
    const [loadingRules, setLoadingRules] = useState(true);

    const [formData, setFormData] = useState({
        name: '', // Initialize empty to avoid hydration mismatch
        phone: '',
        address: '',
        city: '',
        zone: 'dhaka', // 'dhaka' | 'outside'
        payment: 'cod',
        trxId: ''
    });

    // Sync Session Data Safely
    useEffect(() => {
        if (session?.user?.name && !formData.name) {
            setFormData(prev => ({ ...prev, name: session.user.name }));
        }
    }, [session, formData.name]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [verifyingCoupon, setVerifyingCoupon] = useState(false);

    useEffect(() => {
        // Fetch Shipping Rules
        fetch('/api/shipping/rules')
            .then(res => res.json())
            .then(data => {
                setShippingRules(data);
                // Update default payment method if COD is disabled
                if (data.codEnabled === false) {
                    setFormData(prev => ({
                        ...prev,
                        payment: (prev.payment === 'cod') ? 'bkash' : prev.payment
                    }));
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingRules(false));
    }, []);

    // --- Shipping Calculation ---
    let shippingCost = 0;

    if (shippingRules && shippingRules.enabled) {
        // Default to insideDhaka settings if zone not selected? 
        // Or if zone selected check valid.
        const zoneRule = formData.zone === 'dhaka'
            ? shippingRules.insideDhaka
            : shippingRules.outsideDhaka;

        if (zoneRule && zoneRule.enabled) {
            shippingCost = zoneRule.fee;
            // Free Shipping Logic
            if (zoneRule.freeShippingEnabled && cartTotal >= zoneRule.freeShippingMin) {
                shippingCost = 0;
            }
        }
    }

    // Total Calculation
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const preTotal = cartTotal + shippingCost;
    const grandTotal = Math.max(0, preTotal - discount);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";

        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = "Enter valid 11 digit number";
        }

        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";

        if (formData.payment !== 'cod' && !formData.payment?.includes('card') && !formData.trxId.trim()) {
            if (formData.payment === 'bkash' || formData.payment === 'nagad') {
                newErrors.trxId = "Transaction ID is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setVerifyingCoupon(true);
        setCouponError('');

        try {
            const res = await fetch(`/api/coupons/validate?code=${couponCode}&subtotal=${cartTotal}`);
            const data = await res.json();

            if (data.valid) {
                setAppliedCoupon({
                    code: data.coupon.code,
                    discountAmount: data.discountAmount
                });
                setCouponCode('');
            } else {
                setCouponError(data.message || 'Invalid coupon');
                setAppliedCoupon(null);
            }
        } catch (error) {
            setCouponError('Failed to validate coupon');
        } finally {
            setVerifyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Validate Cart Items (Size Selection)
        const hasMissingSize = cart.some(item => item.missingSize || (!item.size && item.size !== "FREE"));
        if (hasMissingSize) {
            alert("অনুগ্রহ করে সব পণ্যের সাইজ নির্বাচন করুন"); // "Please select size for all items"
            // Scroll to items?
            const itemsSection = document.querySelector(`.${styles.cartItems}`);
            if (itemsSection) itemsSection.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    cart,
                    total: grandTotal,
                    couponCode: appliedCoupon ? appliedCoupon.code : null
                })
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                alert('Invalid server response.');
                setIsSubmitting(false);
                return;
            }

            const result = await res.json();
            if (res.ok && result.success) {
                clearCart();
                router.push(`/order/success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`);
            } else {
                alert(result.error || result.details || "Failed to place order.");
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    return (
        <div className={`container ${styles.container}`}>
            <h1 className={styles.title}>{en.checkout.title}</h1>

            <form onSubmit={handlePlaceOrder} className={styles.form}>
                {/* Error Banner */}
                {Object.keys(errors).length > 0 && (
                    <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                        ⚠️ Please fill in all required fields
                    </div>
                )}

                <div className={styles.section}>
                    <h3>{en.checkout.shippingAddress}</h3>
                    <div className={styles.grid}>
                        <Input label="Your Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Enter your name" />
                        <Input label="Mobile Number" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="017XXXXXXXX" type="tel" maxLength={11} />
                        <div className={styles.full}>
                            <Input label="Full Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} placeholder="House No, Road, Area..." />
                        </div>
                        <Input label="City / Customer Zone" name="city" value={formData.city} onChange={handleChange} error={errors.city} placeholder="City Name" />

                        {/* Zone Selector */}
                        {shippingRules?.enabled && (
                            <div className={styles.full}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Delivery Area</label>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    {shippingRules.insideDhaka.enabled && (
                                        <label className={`${styles.option} ${formData.zone === 'dhaka' ? styles.selected : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                                            <input type="radio" name="zone" value="dhaka" checked={formData.zone === 'dhaka'} onChange={handleChange} style={{ marginRight: '8px' }} />
                                            Inside Dhaka ({shippingRules.insideDhaka.freeShippingEnabled && cartTotal >= shippingRules.insideDhaka.freeShippingMin ? 'Free' : `৳${shippingRules.insideDhaka.fee}`})
                                        </label>
                                    )}
                                    {shippingRules.outsideDhaka.enabled && (
                                        <label className={`${styles.option} ${formData.zone === 'outside' ? styles.selected : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                                            <input type="radio" name="zone" value="outside" checked={formData.zone === 'outside'} onChange={handleChange} style={{ marginRight: '8px' }} />
                                            Outside Dhaka ({shippingRules.outsideDhaka.freeShippingEnabled && cartTotal >= shippingRules.outsideDhaka.freeShippingMin ? 'Free' : `৳${shippingRules.outsideDhaka.fee}`})
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>Payment Method</h3>
                    <div className={styles.paymentOptions}>
                        {features.cod_payment && shippingRules?.codEnabled && (
                            <label className={`${styles.option} ${formData.payment === 'cod' ? styles.selected : ''}`}>
                                <input type="radio" name="payment" value="cod" checked={formData.payment === 'cod'} onChange={handleChange} />
                                {en.checkout.cod}
                            </label>
                        )}
                        {features.bkash_payment && (
                            <label className={`${styles.option} ${formData.payment === 'bkash' ? styles.selected : ''}`}>
                                <input type="radio" name="payment" value="bkash" checked={formData.payment === 'bkash'} onChange={handleChange} />
                                {en.checkout.bkash}
                            </label>
                        )}
                        {features.nagad_payment && (
                            <label className={`${styles.option} ${formData.payment === 'nagad' ? styles.selected : ''}`}>
                                <input type="radio" name="payment" value="nagad" checked={formData.payment === 'nagad'} onChange={handleChange} />
                                {en.checkout.nagad}
                            </label>
                        )}
                        {features.card_payment && (
                            <label className={`${styles.option} ${formData.payment === 'card' ? styles.selected : ''}`}>
                                <input type="radio" name="payment" value="card" checked={formData.payment === 'card'} onChange={handleChange} />
                                Card
                            </label>
                        )}
                    </div>

                    {(formData.payment === 'bkash' || formData.payment === 'nagad') && (
                        <div style={{ marginTop: '16px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                            <p style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--secondary)' }}>
                                Please Send Money to: <strong>01700000000</strong>
                            </p>
                            <Input label="Transaction ID" name="trxId" value={formData.trxId} onChange={handleChange} error={errors.trxId} placeholder="Enter TrxID" />
                        </div>
                    )}
                </div>

                {/* Cart Items Review & Size Selection */}
                <div className={styles.section}>
                    <h3>Order Items</h3>
                    <div className={styles.cartItems}>
                        {cart.map((item) => {
                            const isMissingSize = item.missingSize || (!item.size && item.size !== "FREE"); // Fallback check
                            return (
                                <div key={item.id} className={styles.cartItemRow} style={{ display: 'flex', gap: '12px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                                    <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', background: '#f0f0f0' }}>
                                        <img src={item.image || '/placeholder.svg'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <span style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '2px 4px' }}>x{item.quantity}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {item.color !== 'Default' ? item.color : ''}
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>৳{item.price * item.quantity}</div>
                                    </div>

                                    {/* Size Selector for Missing Size */}
                                    {isMissingSize ? (
                                        <div style={{ minWidth: '80px' }}>
                                            <label style={{ fontSize: '11px', color: 'red', display: 'block', marginBottom: '4px' }}>Size Required</label>
                                            <select
                                                className={styles.sizeSelect}
                                                style={{ width: '100%', padding: '4px', border: '1px solid red', borderRadius: '4px', fontSize: '13px' }}
                                                value=""
                                                onChange={(e) => {
                                                    const newSize = e.target.value;
                                                    if (newSize) {
                                                        updateCartItemVariant(item.id, { size: newSize });
                                                    }
                                                }}
                                            >
                                                <option value="" disabled>Select</option>
                                                {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#555' }}>
                                            {item.size !== 'FREE' ? `Size: ${item.size}` : ''}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Summary */}
                <div className={styles.summary} style={{ position: 'sticky', bottom: '0', zIndex: '10' }}>

                    {/* Coupon Section */}
                    <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ddd' }}>
                        {!appliedCoupon ? (
                            <div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <Input placeholder="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ marginBottom: 0 }} />
                                    </div>
                                    <Button type="button" onClick={handleApplyCoupon} disabled={verifyingCoupon || !couponCode}>
                                        {verifyingCoupon ? '...' : 'Apply'}
                                    </Button>
                                </div>
                                {couponError && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{couponError}</p>}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e0f7fa', padding: '8px 12px', borderRadius: '6px', color: '#006064' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Tag size={14} />
                                    <span style={{ fontWeight: '500' }}>{appliedCoupon.code}</span>
                                    <span style={{ fontSize: '12px' }}>(-৳{appliedCoupon.discountAmount})</span>
                                </div>
                                <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#006064', display: 'flex' }}><X size={16} /></button>
                            </div>
                        )}
                    </div>

                    <div className={styles.totalRow} style={{ fontSize: '15px', fontWeight: '400' }}>
                        <span>{en.cart.subtotal}</span>
                        <span>৳{cartTotal}</span>
                    </div>
                    <div className={styles.totalRow} style={{ fontSize: '15px', fontWeight: '400' }}>
                        <span>Delivery Charge</span>
                        <span>{shippingCost === 0 ? 'Free' : `৳${shippingCost}`}</span>
                    </div>

                    {appliedCoupon && (
                        <div className={styles.totalRow} style={{ fontSize: '15px', fontWeight: '500', color: '#00838f' }}>
                            <span>Discount</span>
                            <span>-৳{appliedCoupon.discountAmount}</span>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid #ddd', margin: '12px 0' }}></div>
                    <div className={styles.totalRow} style={{ fontSize: '20px' }}>
                        <span>Total</span>
                        <span className={styles.totalAmount}>৳{grandTotal}</span>
                    </div>

                    <Button fullWidth type="submit" disabled={isSubmitting} style={{ marginTop: '16px', borderRadius: '50px', padding: '16px' }}>
                        {isSubmitting ? 'Processing...' : en.checkout.placeOrder}
                    </Button>
                </div>
            </form >
        </div >
    );
}
