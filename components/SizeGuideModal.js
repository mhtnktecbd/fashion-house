"use client";

import { useEffect, useState } from 'react';
import { X, Ruler } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './SizeGuideModal.module.css';

export default function SizeGuideModal({ isOpen, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && !data) {
            fetch('/api/admin/size-guide')
                .then(res => res.json())
                .then(d => {
                    setData(d);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isOpen, data]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>

                {loading ? (
                    <div className={styles.loading}>Loading size guide...</div>
                ) : (
                    data && data.enabled && (
                        <div className={styles.content}>
                            <h2 className={styles.title}>
                                <Ruler className={styles.icon} size={24} />
                                {data.title}
                            </h2>

                            {data.imageUrl && (
                                <div className={styles.imageWrapper}>
                                    <img src={data.imageUrl} alt="Size Guide Reference" className={styles.image} />
                                </div>
                            )}

                            <div className={styles.markdown}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
