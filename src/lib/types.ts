export type Plan = 'free' | 'pro' | 'team'
export type Tone = 'professional' | 'casual' | 'confident' | 'friendly' | 'technical'
export type Platform = 'upwork' | 'fiverr' | 'linkedin' | 'reddit' | 'other'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  title: string | null
  bio: string | null
  skills: string[]
  hourly_rate: number | null
  portfolio_links: string[]
  preferred_tone: Tone
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  proposals_used: number
  proposals_limit: number
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  user_id: string
  job_post: string
  job_url: string | null
  platform: Platform | null
  generated_proposal: string
  tone: Tone | null
  word_count: number
  is_favorite: boolean
  was_sent: boolean
  got_response: boolean
  response_text: string | null
  follow_up: string | null
  created_at: string
}

export interface JobAnalysis {
  coreNeed: string
  skillsRequired: string[]
  budget: string
  clientTone: string
  redFlags: string[]
  winAngle: string
}

export interface GenerateRequest {
  action: 'generate' | 'followup' | 'cover_letter' | 'variants'
  jobPost: string
  platform?: Platform
  tone?: Tone
  userProfile?: Partial<Profile>
  originalProposal?: string
  clientResponse?: string
}

export interface GenerateResponse {
  proposal?: string
  analysis?: JobAnalysis
  followup?: string
  coverLetter?: string
  variants?: string[]
  usageRemaining: number
  error?: string
}
