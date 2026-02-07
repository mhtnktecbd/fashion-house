"use client";

import { useRef } from 'react';
import HeroToggleForm from '@/components/admin/HeroToggleForm';
import SideBannerManager from '@/components/admin/SideBannerManager';
import { Save } from 'lucide-react';
import styles from './toggles.module.css';

export default function TogglesPage() {
    return (
        <div className={styles.container}>
            {/* Header Area */}
            <div className={styles.headerRow}>
                <div className={styles.titleSection}>
                    <h1>Hero & Banner Manager</h1>
                    <p>Configure your homepage&apos;s visual promotions.</p>
                </div>
            </div>

            <div className={styles.divider} />

            {/* Note: Components will handle their own internal grid/card layout */}
            <div className={styles.contentSection}>
                <HeroToggleForm />

                <div style={{ marginTop: '40px' }}>
                    <SideBannerManager />
                </div>
            </div>
        </div>
    );
}
