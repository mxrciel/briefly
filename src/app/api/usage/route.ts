import { createClient } from '@supabase/supabase-js'
import { createClient as createSupabaseServer } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('proposals_used, proposals_limit, plan')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      used: profile.proposals_used,
      limit: profile.proposals_limit,
      remaining: profile.plan === 'free' 
        ? Math.max(0, profile.proposals_limit - profile.proposals_used)
        : Infinity,
      isPro: profile.plan === 'pro' || profile.plan === 'team',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}

// Reset usage (called monthly via cron)
export async function POST() {
  try {
    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Reset all free users' proposal counts
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ proposals_used: 0 })
      .eq('plan', 'free')
      .gt('proposals_used', 0)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset usage' },
      { status: 500 }
    )
  }
}
