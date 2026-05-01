import { createClient } from '~/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { PLANS, createPaymentSession, createCustomer } from '~/lib/flutterwave'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body // 'pro' or 'team'

    if (!PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planDetails = PLANS[plan as keyof typeof PLANS]

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, flutterwave_customer_id')
      .eq('id', user.id)
      .single()

    // Create or use existing Flutterwave customer
    let customerId = profile?.flutterwave_customer_id

    if (!customerId) {
      const customer = await createCustomer({
        email: profile?.email || user.email!,
        name: profile?.full_name || user.email!.split('@')[0],
        country: 'KE',
      })

      if (customer.status === 'success' && customer.data?.id) {
        customerId = customer.data.id.toString()

        await supabase
          .from('profiles')
          .update({ flutterwave_customer_id: customerId })
          .eq('id', user.id)
      }
    }

    // Create payment session
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${plan}`
    
    const paymentResponse = await createPaymentSession({
      email: profile?.email || user.email!,
      name: profile?.full_name || user.email!.split('@')[0],
      amount: planDetails.amount,
      plan,
      userId: user.id,
      redirectUrl,
    })

    if (paymentResponse.status === 'success' && paymentResponse.data?.link) {
      return NextResponse.json({ url: paymentResponse.data.link })
    } else {
      return NextResponse.json(
        { error: paymentResponse.message || 'Failed to create payment session' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}