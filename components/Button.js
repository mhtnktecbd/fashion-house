"use client";

import styles from './Button.module.css';

export default function Button({ children, variant = "primary", fullWidth, ...props }) {
    return (
        <button
            className={`${styles.btn} ${styles[variant]} ${fullWidth ? styles.full : ''}`}
            {...props}
        >
            {children}
        </button>
    );
}
