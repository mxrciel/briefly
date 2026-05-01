// Flutterwave integration
// Uses direct fetch API instead of SDK to avoid type issues

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY!

export interface PlanDetails {
  name: string
  amount: number // in KES ( shillings)
  interval: 'monthly' | 'annually'
  description: string
}

export const PLANS = {
  pro: {
    name: 'Briefly Pro',
    amount: 2900, // KES 29.00
    interval: 'monthly' as const,
    description: 'Unlimited AI Proposal Generation',
  },
  team: {
    name: 'Briefly Team',
    amount: 4900, // KES 49.00
    interval: 'monthly' as const,
    description: 'Unlimited Proposals for Your Agency',
  },
} as const

export type PlanType = keyof typeof PLANS

export async function createPaymentSession(params: {
  email: string
  name: string
  amount: number
  plan: string
  userId: string
  redirectUrl: string
}) {
  const txRef = `FLW-${Date.now()}-${params.userId}`
  
  const paymentData = {
    tx_ref: txRef,
    amount: params.amount,
    currency: 'KES',
    country: 'KE',
    payment_options: 'mpesa,card',
    redirect_url: params.redirectUrl,
    customer: {
      email: params.email,
      name: params.name,
      phonenumber: '',
    },
    meta: {
      user_id: params.userId,
      plan: params.plan,
    },
    customizations: {
      title: params.plan === 'team' ? 'Briefly Team' : 'Briefly Pro',
      description: params.plan === 'team' 
        ? 'Unlimited Proposals for Your Agency' 
        : 'Unlimited AI Proposal Generation',
    },
  }

  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    },
    body: JSON.stringify(paymentData),
  })
  return response.json()
}

export async function createCustomer(data: {
  email: string
  name: string
  phone_number?: string
  country?: string
}) {
  const response = await fetch('https://api.flutterwave.com/v3/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    },
    body: JSON.stringify(data),
  })
  return response.json()
}