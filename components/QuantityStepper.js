"use client";

import { useState } from 'react';
import styles from './QuantityStepper.module.css';

export default function QuantityStepper({ value = 1, onChange, min = 1, max = 10 }) {
    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleChange = (e) => {
        const newValue = parseInt(e.target.value) || min;
        if (newValue >= min && newValue <= max) {
            onChange(newValue);
        }
    };

    return (
        <div className={styles.stepper}>
            <button
                type="button"
                className={styles.btn}
                onClick={handleDecrement}
                disabled={value <= min}
                aria-label="Decrease quantity"
            >
                −
            </button>
            <input
                type="number"
                className={styles.input}
                value={value}
                onChange={handleChange}
                min={min}
                max={max}
                readOnly
            />
            <button
                type="button"
                className={styles.btn}
                onClick={handleIncrement}
                disabled={value >= max}
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    );
}
