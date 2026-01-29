import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getFullName } from '@/lib/utils/formatters';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // Verify admin role
    const { data: admin } = await supabase
        .from('teachers')
        .select('role, first_name, last_name')
        .eq('email', session.user.email)
        .single();

    if (!admin || admin.role !== 'admin') {
        redirect('/teacher/dashboard');
    }

    // Get statistics
    const { count: totalTeachers } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');

    const { count: totalSkills } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    const { count: pendingSkills } = await supabase
        .from('teacher_skills')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

    const { count: pendingGoals } = await supabase
        .from('teacher_goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

    const fullName = getFullName(admin.first_name, admin.last_name);

    return (
        <div>
            <Header teacherName={fullName} role="Administrator" />
            <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

                {/* Statistics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <Card>
                        <CardContent>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-600)', marginBottom: '0.5rem' }}>
                                {totalTeachers || 0}
                            </h3>
                            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Total Teachers</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-600)', marginBottom: '0.5rem' }}>
                                {totalSkills || 0}
                            </h3>
                            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Active Skills</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                                {pendingSkills || 0}
                            </h3>
                            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Pending Skill Approvals</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                                {pendingGoals || 0}
                            </h3>
                            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Pending Goal Approvals</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a href="/admin/teachers" style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--gray-900)', fontWeight: 500, transition: 'background var(--transition-base)' }}>
                                📋 Manage Teachers
                            </a>
                            <a href="/admin/skills" style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--gray-900)', fontWeight: 500, transition: 'background var(--transition-base)' }}>
                                🎯 Manage Skills
                            </a>
                            <a href="/admin/goals" style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--gray-900)', fontWeight: 500, transition: 'background var(--transition-base)' }}>
                                🎓 Manage Yearly Goals
                            </a>
                            <a href="/admin/approvals" style={{ padding: '1rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--gray-900)', fontWeight: 500, transition: 'background var(--transition-base)' }}>
                                ✅ Pending Approvals ({(pendingSkills || 0) + (pendingGoals || 0)})
                            </a>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p style={{ color: 'var(--gray-700)' }}>
                            Welcome to the Teacher Portfolio Platform administrative dashboard.
                            From here you can manage teacher profiles, skills, goals, and approve achievements.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
