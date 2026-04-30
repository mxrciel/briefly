import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Admin client for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          
          const customerId = session.customer as string
          const subscriptionId = subscription.id
          
          // Determine plan based on price ID
          const priceId = subscription.items.data[0]?.price.id
          let plan: 'free' | 'pro' | 'team' = 'free'
          
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            plan = 'pro'
          } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
            plan = 'team'
          }

          // Get user by customer ID
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({
                plan,
                stripe_subscription_id: subscriptionId,
                proposals_limit: plan === 'free' ? 5 : -1, // -1 for unlimited
              })
              .eq('id', profile.id)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by subscription ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'free',
              stripe_subscription_id: null,
              proposals_limit: 5,
              proposals_used: 0,
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        if (subscription.status === 'active') {
          const priceId = subscription.items.data[0]?.price.id
          let plan: 'free' | 'pro' | 'team' = 'free'
          
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            plan = 'pro'
          } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
            plan = 'team'
          }

          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({
                plan,
                proposals_limit: plan === 'free' ? 5 : -1,
              })
              .eq('id', profile.id)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
