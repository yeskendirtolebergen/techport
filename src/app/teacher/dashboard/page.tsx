import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { TeacherProfile } from '@/components/teacher/TeacherProfile';
import { getFullName } from '@/lib/utils/formatters';
import type { Teacher, Certification, TeacherSkill, TeacherGoal } from '@/types';

export default async function TeacherDashboard() {
    const supabase = await createClient();

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // Get teacher profile
    const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', session.user.email)
        .single();

    if (teacherError || !teacher) {
        redirect('/login');
    }

    // Get certifications
    const { data: certifications } = await supabase
        .from('certifications')
        .select('*')
        .eq('teacher_id', teacher.id)
        .single();

    // Get teacher skills with skill details
    const { data: teacherSkills } = await supabase
        .from('teacher_skills')
        .select(`
      *,
      skill:skills(*)
    `)
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

    // Get teacher goals with goal details
    const { data: teacherGoals } = await supabase
        .from('teacher_goals')
        .select(`
      *,
      goal:yearly_goals(*)
    `)
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

    // Get student results
    const { data: studentResults } = await supabase
        .from('student_results')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('year', { ascending: false });

    const fullName = getFullName(teacher.first_name, teacher.last_name);

    return (
        <div>
            <Header teacherName={fullName} role="Teacher" />
            <main style={{ padding: '2rem' }}>
                <TeacherProfile
                    teacher={teacher as Teacher}
                    certifications={certifications as Certification || undefined}
                    teacherSkills={teacherSkills as TeacherSkill[] || []}
                    teacherGoals={teacherGoals as TeacherGoal[] || []}
                    studentResults={studentResults || []}
                />
            </main>
        </div>
    );
}
