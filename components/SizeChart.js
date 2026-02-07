"use client";

import { useState } from 'react';
import styles from './SizeChart.module.css';

export default function SizeChart({ sizeChart }) {
    const { defaultUnit = 'INCH' } = sizeChart || {};
    const [activeUnit, setActiveUnit] = useState(defaultUnit);

    if (!sizeChart || !sizeChart.enabled || !sizeChart.rows || sizeChart.rows.length === 0) {
        return null;
    }

    const { columns = [], rows = [] } = sizeChart;

    // Convert value between INCH and CM
    const convertValue = (value, fromUnit, toUnit) => {
        if (fromUnit === toUnit) return value;
        if (toUnit === 'CM') {
            return (value * 2.54).toFixed(1);
        } else {
            return (value / 2.54).toFixed(1);
        }
    };

    // Get converted rows based on active unit
    const getConvertedRows = () => {
        return rows.map(row => {
            const convertedRow = { ...row };
            columns.forEach(col => {
                if (typeof row[col] === 'number') {
                    convertedRow[col] = parseFloat(convertValue(row[col], defaultUnit, activeUnit));
                }
            });
            return convertedRow;
        });
    };

    const convertedRows = getConvertedRows();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    Size Chart - In {activeUnit === 'INCH' ? 'Inches' : 'Centimeters'}
                    <span className={styles.subtitle}>(Expected Deviation &lt; 3%)</span>
                </h3>
                <div className={styles.tabs}>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeUnit === 'INCH' ? styles.tabActive : ''}`}
                        onClick={() => setActiveUnit('INCH')}
                    >
                        INCH
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeUnit === 'CM' ? styles.tabActive : ''}`}
                        onClick={() => setActiveUnit('CM')}
                    >
                        CM
                    </button>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Size</th>
                            {columns.map((col, idx) => (
                                <th key={idx}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {convertedRows.map((row, idx) => (
                            <tr key={idx}>
                                <td className={styles.sizeCell}>{row.size}</td>
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx}>{row[col] || '-'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
