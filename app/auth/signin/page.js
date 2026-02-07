"use client";

import { useFeatures } from '@/app/providers';
import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import styles from './signin.module.css';

function SignInContent() {
    const features = useFeatures();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!features) return null; // Loading

    const handleCredentialsLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        await signIn('credentials', {
            email,
            password,
            callbackUrl
        });
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome Back</h1>

                {features.account_system && features.google_login && (
                    <div className={styles.section}>
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => signIn('google', { callbackUrl })}
                        >
                            Sign in with Google
                        </Button>
                    </div>
                )}

                {features.account_system && features.google_login && features.email_login && (
                    <div className={styles.divider}>OR</div>
                )}

                {features.account_system && features.email_login && (
                    <form onSubmit={handleCredentialsLogin} className={styles.form}>
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button fullWidth disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                )}

                {!features.account_system && (
                    <p className={styles.message}>User accounts are currently disabled.</p>
                )}
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
}
