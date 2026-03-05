import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (!webhookSecret || !signature) {
    console.error('Webhook secret or signature missing');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        await supabase
          .from('trucks')
          .update({
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
          })
          .eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;

      let appStatus = 'active';
      if (status === 'trialing') appStatus = 'trial';
      else if (status === 'active') appStatus = 'active';
      else if (status === 'past_due') appStatus = 'past_due';
      else if (status === 'canceled' || status === 'unpaid') appStatus = 'canceled';

      await supabase
        .from('trucks')
        .update({ subscription_status: appStatus })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from('trucks')
        .update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from('trucks')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}