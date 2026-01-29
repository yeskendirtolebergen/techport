'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import styles from './Header.module.css';

interface HeaderProps {
    teacherName?: string;
    role?: string;
}

export function Header({ teacherName, role }: HeaderProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logoSection}>
                    <h1 className={styles.logo}>Teacher Portfolio</h1>
                </div>

                <div className={styles.userSection}>
                    {teacherName && (
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{teacherName}</span>
                            {role && <span className={styles.userRole}>{role}</span>}
                        </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Sign Out
                    </Button>
                </div>
            </div>
        </header>
    );
}
