import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, email } = body;

  if (!userId || !email) {
    return NextResponse.json({ error: 'Missing user info' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user already has a Stripe customer
  const { data: truck } = await supabase
    .from('trucks')
    .select('stripe_customer_id, trial_ends_at')
    .eq('id', userId)
    .single();

  let customerId = truck?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customerId = customer.id;

    await supabase
      .from('trucks')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  // Only apply trial if the user has never had one (trial_ends_at not set)
  const isFirstTime = !truck?.trial_ends_at;
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${request.headers.get('origin')}/dashboard/profile?billing=success`,
    cancel_url: `${request.headers.get('origin')}/dashboard/profile?billing=cancel`,
    metadata: { userId },
  };
  if (isFirstTime) {
    sessionParams.subscription_data = { trial_period_days: 7 };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ url: session.url });
}