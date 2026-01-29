'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [iin, setIin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = createClient();

            // Get teacher's email from IIN
            const { data: teacher, error: teacherError } = await supabase
                .from('teachers')
                .select('email, role')
                .eq('iin', iin)
                .single();

            if (teacherError || !teacher) {
                setError('Invalid IIN or password');
                setLoading(false);
                return;
            }

            // Sign in with email and password
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: teacher.email,
                password: password,
            });

            if (signInError) {
                setError('Invalid IIN or password');
                setLoading(false);
                return;
            }

            // Redirect based on role
            if (teacher.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/teacher/dashboard');
            }

            router.refresh();
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.logoSection}>
                    <h1 className={styles.logo}>Teacher Portfolio</h1>
                    <p className={styles.subtitle}>Academic Portfolio Platform</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Input
                                type="text"
                                label="IIN (Individual Identification Number)"
                                placeholder="Enter your 12-digit IIN"
                                value={iin}
                                onChange={(e) => setIin(e.target.value)}
                                required
                                maxLength={12}
                                pattern="[0-9]{12}"
                            />

                            <Input
                                type="password"
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {error && (
                                <div className={styles.error}>
                                    <svg
                                        className={styles.errorIcon}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <Button type="submit" fullWidth loading={loading} className={styles.submitButton}>
                                Sign In
                            </Button>
                        </form>

                        <p className={styles.helpText}>
                            Don't have an account? Contact your school administrator.
                        </p>
                    </CardContent>
                </Card>

                <p className={styles.footer}>
                    © 2026 Teacher Portfolio Platform. All rights reserved.
                </p>
            </div>
        </div>
    );
}
