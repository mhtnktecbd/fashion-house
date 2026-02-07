"use client";

import { useEffect, useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, Award, Star, CheckCircle, Package } from 'lucide-react';
import styles from './TrustBadgeRow.module.css';

const ICON_MAP = {
    ShieldCheck, Truck, RotateCcw, Award, Star, CheckCircle, Package
};

export default function TrustBadgeRow() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api/admin/trust-badges')
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    if (!data || !data.enabled || !data.items || data.items.length === 0) return null;

    return (
        <div className="container">
            <div className={styles.row}>
                {data.items.slice(0, 4).map((item, idx) => {
                    const Icon = ICON_MAP[item.icon] || ShieldCheck;
                    return (
                        <div key={idx} className={styles.item}>
                            <div className={styles.iconWrapper}>
                                <Icon size={20} strokeWidth={1.5} />
                            </div>
                            <span className={styles.text}>{item.text}</span>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
