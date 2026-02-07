"use client";

import styles from './ActionButton.module.css';

// Reusable Action Button Component
// Implements styles via CSS Module since Tailwind is not installed
export default function ActionButton({
    children,
    variant = "solid",
    fullWidth = true,
    className = "",
    disabled = false,
    ...props
}) {
    const variantClass = styles[variant] || styles.solid;
    const widthClass = fullWidth ? styles.fullWidth : '';
    const disabledClass = disabled ? styles.disabled : '';

    return (
        <button
            className={`${styles.btn} ${variantClass} ${widthClass} ${disabledClass} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
