import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  // For now, redirect to login. Later this will be the landing page in Next.js
  // Currently the landing page is the static index.html
  redirect('/auth/login');
}