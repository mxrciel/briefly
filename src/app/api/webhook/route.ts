import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Admin client for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify Flutterwave webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET!
  const hash = crypto.createHmac('sha256', secretHash).update(payload).digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('flutterwave-webhook-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const event = JSON.parse(body)

    switch (event.event) {
      case 'charge.completed': {
        const data = event.data

        // Check if this is a subscription payment
        if (data.meta && data.meta.plan) {
          const userId = data.meta.user_id
          const plan = data.meta.plan as 'pro' | 'team'

          if (userId && plan) {
            await supabaseAdmin
              .from('profiles')
              .update({
                plan,
                proposals_limit: -1, // unlimited
                flutterwave_subscription_id: data.id,
              })
              .eq('id', userId)
          }
        }
        break
      }

      case 'subscription.cancelled': {
        const data = event.data

        // Find user by flutterwave customer ID
        const customerId = data.customer?.id?.toString()

        if (customerId) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('flutterwave_customer_id', customerId)
            .single()

          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({
                plan: 'free',
                flutterwave_subscription_id: null,
                proposals_limit: 5,
                proposals_used: 0,
              })
              .eq('id', profile.id)
          }
        }
        break
      }

      default:
        console.log(`Unhandled Flutterwave event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Flutterwave webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}