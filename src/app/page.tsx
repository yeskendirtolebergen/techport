import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check user role and redirect accordingly
  const { data: teacher } = await supabase
    .from('teachers')
    .select('role')
    .eq('email', session.user.email)
    .single();

  if (teacher?.role === 'admin') {
    redirect('/admin/dashboard');
  } else {
    redirect('/teacher/dashboard');
  }
}
