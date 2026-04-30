import { createClient } from '~/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const PROPOSAL_SYSTEM_PROMPT = `You are an elite freelance proposal writer. You write proposals that win jobs.

Rules:
1. NEVER sound generic. Every proposal must feel hand-written for that specific job.
2. Mirror the client's tone.
3. Lead with THEIR problem, not your resume.
4. Be specific. Reference details from the job post.
5. Keep it under 200 words.
6. End with a clear, low-pressure call to action.
7. Never lie about skills or experience.
8. Use 'you' more than 'I'.

Structure:
1. Hook — Show you understand their problem (1-2 sentences)
2. Approach — How you'd solve it (2-3 sentences)
3. Proof — Relevant experience (1-2 sentences)
4. CTA — Simple next step (1 sentence)

NEVER start with 'Dear Sir/Madam' or 'Hello, I am...'. NEVER use buzzwords like synergy or leverage.`

const ANALYSIS_SYSTEM_PROMPT = `You are a job posting analyzer for freelancers. Analyze the job post and return a JSON object with:
- coreNeed: The main problem the client needs solved
- skillsRequired: Array of specific skills needed
- budget: The budget range if mentioned, or "Not specified"
- clientTone: The tone of the job post (professional, casual, urgent, relaxed, etc.)
- redFlags: Array of potential red flags (vague requirements, too good to be true, etc.)
- winAngle: What makes this client a good fit and how to stand out

Return ONLY valid JSON, no markdown formatting or explanation.`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action, jobPost, platform, tone, userProfile, originalProposal, clientResponse } = body

    // Check usage limits
    const isPro = profile.plan === 'pro' || profile.plan === 'team'
    if (!isPro && profile.proposals_used >= profile.proposals_limit) {
      return NextResponse.json({ error: 'Monthly limit reached' }, { status: 429 })
    }

    let proposal: string
    let analysis: any = null

    switch (action) {
      case 'generate':
        // Generate proposal
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: PROPOSAL_SYSTEM_PROMPT },
            { 
              role: 'user', 
              content: `Platform: ${platform || 'general'}\nTone: ${tone || 'professional'}\n\nJob Post:\n${jobPost}\n\n${userProfile?.title ? `My Title: ${userProfile.title}` : ''}\n${userProfile?.bio ? `My Experience: ${userProfile.bio}` : ''}\n${userProfile?.skills?.length ? `My Skills: ${userProfile.skills.join(', ')}` : ''}\n${userProfile?.hourly_rate ? `My Rate: $${userProfile.hourly_rate}/hr` : ''}`
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        })

        proposal = completion.choices[0].message.content || ''

        // Also get analysis
        try {
          const analysisCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
              { role: 'user', content: jobPost },
            ],
            max_tokens: 300,
            temperature: 0.5,
          })

          const analysisText = analysisCompletion.choices[0].message.content || '{}'
          analysis = JSON.parse(analysisText)
        } catch (e) {
          // Analysis is optional, don't fail if it doesn't work
          console.error('Analysis failed:', e)
        }

        // Save proposal to database
        const wordCount = proposal.trim().split(/\s+/).filter(Boolean).length
        await supabase.from('proposals').insert({
          user_id: user.id,
          job_post: jobPost,
          platform: platform || 'other',
          generated_proposal: proposal,
          tone: tone || 'professional',
          word_count: wordCount,
        })

        // Increment usage counter
        await supabase
          .from('profiles')
          .update({ proposals_used: profile.proposals_used + 1 })
          .eq('id', user.id)

        break

      case 'followup':
        if (!originalProposal || !clientResponse) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const followupCompletion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You write follow-up messages for freelance proposals. Keep them short (under 100 words), professional, and persistent without being pushy. Reference the original proposal naturally.' },
            { role: 'user', content: `Original Proposal:\n${originalProposal}\n\nClient Response:\n${clientResponse}` },
          ],
          max_tokens: 200,
          temperature: 0.7,
        })

        proposal = followupCompletion.choices[0].message.content || ''
        break

      case 'cover_letter':
        const coverLetterCompletion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You write professional cover letters for freelance job applications. Be concise, highlight relevant experience, and make a compelling case for why the client should choose you.' },
            { role: 'user', content: `Job Description:\n${jobPost}\n\nMy Experience:\n${userProfile?.bio || 'Not provided'}\n\nMy Skills:\n${userProfile?.skills?.join(', ') || 'Not provided'}\n\nMy Title:\n${userProfile?.title || 'Not provided'}` },
          ],
          max_tokens: 400,
          temperature: 0.7,
        })

        proposal = coverLetterCompletion.choices[0].message.content || ''
        break

      case 'variants':
        const variant1 = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: PROPOSAL_SYSTEM_PROMPT + '\n\nThis is VARIANT A - More direct and confident.' },
            { role: 'user', content: `Platform: ${platform || 'general'}\nTone: ${tone || 'professional'}\n\nJob Post:\n${jobPost}` },
          ],
          max_tokens: 500,
          temperature: 0.8,
        })

        const variant2 = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: PROPOSAL_SYSTEM_PROMPT + '\n\nThis is VARIANT B - More friendly and relationship-focused.' },
            { role: 'user', content: `Platform: ${platform || 'general'}\nTone: friendly\n\nJob Post:\n${jobPost}` },
          ],
          max_tokens: 500,
          temperature: 0.8,
        })

        proposal = variant1.choices[0].message.content || ''
        const variant2Text = variant2.choices[0].message.content || ''
        
        return NextResponse.json({
          proposal,
          variants: [proposal, variant2Text],
          usageRemaining: isPro ? Infinity : profile.proposals_limit - profile.proposals_used - 1,
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      proposal,
      analysis,
      usageRemaining: isPro ? Infinity : profile.proposals_limit - profile.proposals_used - 1,
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate proposal' },
      { status: 500 }
    )
  }
}
