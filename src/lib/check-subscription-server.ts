import { createClient } from '@supabase/supabase-js';

export async function checkSubscriptionServer(userId: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: truck } = await supabase
    .from('trucks')
    .select('subscription_status, trial_ends_at')
    .eq('id', userId)
    .single();

  if (!truck) return false;

  const status = truck.subscription_status;

  if (status === 'active') return true;

  if (status === 'trial' && truck.trial_ends_at) {
    return new Date() < new Date(truck.trial_ends_at);
  }

  return false;
}
