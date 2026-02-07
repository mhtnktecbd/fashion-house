"use client";

import styles from './ReturnInfoBox.module.css';

export default function ReturnInfoBox({ returnInfo }) {
    if (!returnInfo) return null;

    const { title = "Easy Returns & Exchange", bullets = [], note } = returnInfo;

    const getIcon = (iconType) => {
        switch (iconType) {
            case 'check':
                return '✓';
            case 'shield':
                return '🛡️';
            case 'truck':
                return '🚚';
            default:
                return '✓';
        }
    };

    return (
        <div className={styles.box}>
            <h3 className={styles.title}>{title}</h3>
            <ul className={styles.list}>
                {bullets.map((bullet, index) => (
                    <li key={index} className={styles.item}>
                        <span className={styles.icon}>{getIcon(bullet.icon)}</span>
                        <span>{bullet.text}</span>
                    </li>
                ))}
            </ul>
            {note && <p className={styles.note}>{note}</p>}
        </div>
    );
}
