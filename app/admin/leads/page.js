"use client";

import styles from '../admin.module.css';

export default function AdminLeadsPage() {
    return (
        <div>
            <h1 className={styles.sectionTitle}>Leads (Abandoned Cart)</h1>
            <div className={styles.card}>
                <p className={styles.textMutedOnCard}>Track abandoned checkouts and potential customers here. (Coming Soon)</p>
            </div>
        </div>
    );
}
