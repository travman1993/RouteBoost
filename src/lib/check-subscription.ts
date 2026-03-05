import { createClient } from '@/lib/supabase-browser';

export interface SubscriptionStatus {
  status: string;
  isActive: boolean;
  trialEndsAt: string | null;
  daysLeft: number | null;
}

export async function checkSubscription(): Promise<SubscriptionStatus> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: 'none', isActive: false, trialEndsAt: null, daysLeft: null };
  }

  const { data: truck } = await supabase
    .from('trucks')
    .select('subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single();

  if (!truck) {
    return { status: 'none', isActive: false, trialEndsAt: null, daysLeft: null };
  }

  const status = truck.subscription_status || 'trial';
  const trialEndsAt = truck.trial_ends_at;

  // Check if trial is still valid
  if (status === 'trial' && trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) {
      return { status: 'trial', isActive: true, trialEndsAt, daysLeft };
    } else {
      return { status: 'trial_expired', isActive: false, trialEndsAt, daysLeft: 0 };
    }
  }

  const isActive = status === 'active' || status === 'trial';

  return { status, isActive, trialEndsAt, daysLeft: null };
}