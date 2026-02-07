"use client";

import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CartDrawer.module.css';
import { useEffect } from 'react';

export default function CartDrawer() {
    const { isCartOpen, closeCart, openQuickView } = useUI();
    const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();

    // Prevent body scroll when open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    return (
        <div className={styles.overlay} onClick={closeCart}>
            <div className={styles.drawer} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Shopping Cart ({cart.length})</h2>
                    <button className={styles.closeBtn} onClick={closeCart}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.items}>
                    {cart.length === 0 ? (
                        <div className={styles.empty}>
                            <p>Your cart is empty.</p>
                            <button className={styles.continueBtn} onClick={closeCart}>Start Shopping</button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.imageWrapper}>
                                    <Image src={item.image || '/placeholder.svg'} alt={item.title} fill style={{ objectFit: 'cover' }} />
                                </div>
                                <div className={styles.itemDetails}>
                                    <Link href={`/product/${item.slug}`} className={styles.itemTitle} onClick={closeCart}>
                                        {item.title}
                                    </Link>
                                    <div className={styles.variantInfo}>
                                        {item.size && item.size !== 'FREE' && <span>Size: {item.size}</span>}
                                        {item.color && item.color !== 'Default' && <span>Color: {item.color}</span>}
                                    </div>

                                    {item.missingSize && (
                                        <button
                                            className={styles.fixBtn}
                                            onClick={() => {
                                                closeCart();
                                                setTimeout(() => openQuickView(item), 100); // Small delay to smooth transition
                                            }}
                                        >
                                            <AlertCircle size={12} /> Select Size
                                        </button>
                                    )}

                                    <div className={styles.controls}>
                                        <div className={styles.qty}>
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={14} /></button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                                        </div>
                                        <div className={styles.priceInfo}>
                                            <span className={styles.itemPrice}>৳{item.price * item.quantity}</span>
                                            <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.subtotal}>
                            <span>Subtotal</span>
                            <span>৳{cartTotal}</span>
                        </div>
                        <p className={styles.note}>Shipping & taxes calculated at checkout.</p>
                        <Link href="/checkout" className={styles.checkoutBtn} onClick={closeCart}>
                            Checkout Now
                        </Link>
                        <Link href="/cart" className={styles.viewCartBtn} onClick={closeCart}>
                            View Cart Page
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
