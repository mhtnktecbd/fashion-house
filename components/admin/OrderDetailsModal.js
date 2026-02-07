import { X, Calendar, User, MapPin, Phone, CreditCard, Package } from 'lucide-react';
import styles from './OrderDetailsModal.module.css';

export default function OrderDetailsModal({ order, isOpen, onClose, onUpdateStatus }) {
    if (!isOpen || !order) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#ca8a04';
            case 'PROCESSING': return '#2563eb';
            case 'DELIVERED': return '#16a34a';
            case 'CANCELLED': return '#dc2626';
            default: return '#666';
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Order #{order.orderNumber || order.id.slice(0, 8)}</h2>
                        <div className={styles.meta}>
                            <Calendar size={14} />
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.body}>
                    {/* Status Bar */}
                    <div className={styles.statusBar} style={{ borderColor: getStatusColor(order.status) }}>
                        <div className={styles.statusLabel}>Current Status</div>
                        <div className={styles.statusValue} style={{ color: getStatusColor(order.status) }}>
                            {order.status}
                        </div>
                        <div className={styles.actions}>
                            {['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map(status => (
                                <button
                                    key={status}
                                    className={`${styles.statusBtn} ${order.status === status ? styles.active : ''}`}
                                    onClick={() => onUpdateStatus(order.id, status)}
                                    title={`Mark as ${status}`}
                                >
                                    {status[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.grid}>
                        {/* Customer Info */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                <User size={16} /> Customer Details
                            </h3>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Name:</span>
                                <span className={styles.value}>{order.guestName}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Phone:</span>
                                <span className={styles.value}>{order.guestPhone}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Payment:</span>
                                <span className={styles.value} style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    {order.paymentMethod}
                                </span>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                <MapPin size={16} /> Shipping Address
                            </h3>
                            <div className={styles.addressBox}>
                                {order.guestAddress}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <Package size={16} /> Order Items
                        </h3>
                        <div className={styles.itemsList}>
                            {order.items.map((item, idx) => (
                                <div key={idx} className={styles.item}>
                                    {/* Image placeholder or check if item has image url saved? 
                                        Usually items in order are minimal. Check prisma schema. 
                                        If no image, use generic icon.
                                    */}
                                    <div className={styles.itemIcon}>
                                        <Package size={20} color="#666" />
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <div className={styles.itemTitle}>{item.title}</div>
                                        <div className={styles.itemVariant}>
                                            {item.size !== 'FREE' && <span className={styles.pill}>{item.size}</span>}
                                            {item.color !== 'Default' && <span className={styles.pill}>{item.color}</span>}
                                        </div>
                                    </div>
                                    <div className={styles.itemQty}>x{item.quantity}</div>
                                    <div className={styles.itemPrice}>৳{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className={styles.totalSection}>
                        <div className={styles.totalRow}>
                            <span>Subtotal</span>
                            <span>৳{order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}</span>
                        </div>
                        {/* We don't store shipping fee separately in Order model usually? 
                            Just totalAmount. But we can infer. 
                            Let's just show Total for now unless we split it in schema.
                        */}
                        <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                            <span>Total Amount</span>
                            <span>৳{order.totalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
