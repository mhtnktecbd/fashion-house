"use client";

import { signIn, useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import styles from './login.module.css';

export default function AdminLoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session) {
            if (session.user.role === 'ADMIN') {
                router.push('/admin');
            } else {
                // Not an admin, sign out and redirect home
                signOut({ redirect: false }).then(() => {
                    router.push('/?error=UnauthorizedAdmin');
                });
            }
        }
    }, [session, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (res.error) {
                setError("Invalid credentials");
                setLoading(false);
            } else {
                // Session useEffect will handle routing
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    if (status === 'loading') return <div className={styles.loading}>Checking session...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.logo}>AB Admin</h1>
                    <p className={styles.subtitle}>Administrative Portal Login</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <Input
                        label="Admin Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@example.com"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button fullWidth disabled={loading}>
                        {loading ? "Verifying..." : "Login to Dashboard"}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <Link href="/" className={styles.backLink}>← Return to storefront</Link>
                </div>
            </div>
        </div>
    );
}
