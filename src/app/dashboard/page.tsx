'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Textarea } from '~/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Input } from '~/components/ui/input'
import { createClient } from '~/lib/supabase/client'
import { cn, countWords, formatDate } from '~/lib/utils'
import { useToast } from '~/components/ui/toast'
import {
  Sparkles,
  Copy,
  Check,
  Star,
  StarOff,
  Trash2,
  ExternalLink,
  Briefcase,
  Clock,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  User,
  Code,
  DollarSign,
  MessageSquare,
  Loader2,
  X,
  Plus,
  FileText,
} from 'lucide-react'
import type { Profile, Proposal, Tone, Platform } from '~/lib/types'

const TONES: { value: Tone; label: string; emoji: string }[] = [
  { value: 'professional', label: 'Professional', emoji: '👔' },
  { value: 'casual', label: 'Casual', emoji: '✌️' },
  { value: 'confident', label: 'Confident', emoji: '💪' },
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'technical', label: 'Technical', emoji: '⚙️' },
]

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'upwork', label: 'Upwork' },
  { value: 'fiverr', label: 'Fiverr' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'other', label: 'Other' },
]

interface JobAnalysis {
  coreNeed: string
  skillsRequired: string[]
  budget: string
  clientTone: string
  redFlags: string[]
  winAngle: string
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  
  const [activeTab, setActiveTab] = useState('generate')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null)
  
  // Generate state
  const [jobPost, setJobPost] = useState('')
  const [platform, setPlatform] = useState<Platform>('upwork')
  const [tone, setTone] = useState<Tone>('professional')
  const [generatedProposal, setGeneratedProposal] = useState('')
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null)
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    title: '',
    bio: '',
    hourly_rate: '',
    skills: [] as string[],
    portfolio_links: [] as string[],
    preferred_tone: 'professional' as Tone,
  })
  const [newSkill, setNewSkill] = useState('')
  const [newLink, setNewLink] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'history' || tab === 'profile') {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    loadProfile()
    loadProposals()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
        setProfileForm({
          full_name: data.full_name || '',
          title: data.title || '',
          bio: data.bio || '',
          hourly_rate: data.hourly_rate?.toString() || '',
          skills: data.skills || [],
          portfolio_links: data.portfolio_links || [],
          preferred_tone: data.preferred_tone || 'professional',
        })
        setTone(data.preferred_tone || 'professional')
      }
    }
  }

  const loadProposals = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setProposals(data)
      }
    }
  }

  const handleGenerate = async () => {
    if (!jobPost.trim()) return
    
    setIsLoading(true)
    setGeneratedProposal('')
    setJobAnalysis(null)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          jobPost,
          platform,
          tone,
          userProfile: profile,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 429) {
          addToast('Monthly limit reached. Upgrade to Pro for unlimited proposals.', 'warning')
        } else {
          addToast(data.error || 'Failed to generate proposal', 'error')
        }
        return
      }
      
      setGeneratedProposal(data.proposal)
      setJobAnalysis(data.analysis)
      
      // Refresh proposals
      loadProposals()
      loadProfile()
      
      addToast('Proposal generated successfully!', 'success')
    } catch (err) {
      addToast('An unexpected error occurred', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedProposal) return
    await navigator.clipboard.writeText(generatedProposal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase
      .from('proposals')
      .update({ is_favorite: !current })
      .eq('id', id)
    
    loadProposals()
  }

  const deleteProposal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return
    
    const supabase = createClient()
    await supabase.from('proposals').delete().eq('id', id)
    
    loadProposals()
    if (expandedProposal === id) setExpandedProposal(null)
    addToast('Proposal deleted', 'info')
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    setProfileForm(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }))
    setNewSkill('')
  }

  const removeSkill = (skill: string) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }))
  }

  const addLink = () => {
    if (!newLink.trim()) return
    setProfileForm(prev => ({
      ...prev,
      portfolio_links: [...prev.portfolio_links, newLink.trim()],
    }))
    setNewLink('')
  }

  const removeLink = (link: string) => {
    setProfileForm(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.filter(l => l !== link),
    }))
  }

  const saveProfile = async () => {
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return
    
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          title: profileForm.title,
          bio: profileForm.bio,
          hourly_rate: profileForm.hourly_rate ? parseFloat(profileForm.hourly_rate) : null,
          skills: profileForm.skills,
          portfolio_links: profileForm.portfolio_links,
          preferred_tone: profileForm.preferred_tone,
        })
        .eq('id', user.id)
      
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
      loadProfile()
      addToast('Profile saved!', 'success')
    } catch (err) {
      addToast('Failed to save profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const usageCount = profile?.proposals_used ?? 0
  const usageLimit = profile?.proposals_limit ?? 5
  const isPro = profile?.plan === 'pro' || profile?.plan === 'team'
  const canGenerate = isPro || usageCount < usageLimit

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-gold" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-cream">Platform</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setPlatform(p.value)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                          platform === p.value
                            ? 'bg-gold text-background'
                            : 'bg-surface text-grey hover:text-cream'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-cream">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                          tone === t.value
                            ? 'bg-gold text-background'
                            : 'bg-surface text-grey hover:text-cream'
                        )}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-cream">Job Post</label>
                  <Textarea
                    value={jobPost}
                    onChange={(e) => setJobPost(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="min-h-[250px]"
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-grey">{jobPost.length} characters</span>
                  </div>
                </div>

                {canGenerate ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={!jobPost.trim() || isLoading}
                    loading={isLoading}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Proposal
                      </>
                    )}
                  </Button>
                ) : (
                  <Link href="/#pricing">
                    <Button className="w-full gap-2" size="lg">
                      <Zap className="h-5 w-5" />
                      Upgrade to Pro — Unlimited Proposals
                    </Button>
                  </Link>
                )}

                {!isPro && (
                  <p className="text-center text-xs text-grey">
                    {usageCount}/{usageLimit} proposals used this month
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Output */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gold" />
                    Generated Proposal
                  </CardTitle>
                  {generatedProposal && (
                    <Badge variant="gold">{countWords(generatedProposal)} words</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {generatedProposal ? (
                    <>
                      <div className="min-h-[300px] rounded-lg border border-border bg-background p-4">
                        <p className="whitespace-pre-wrap text-cream">{generatedProposal}</p>
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant="secondary"
                        className="mt-4 w-full gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy to Clipboard
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-border bg-background">
                      <p className="text-grey">
                        {isLoading ? 'Generating your proposal...' : 'Your proposal will appear here'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Analysis */}
              {jobAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple" />
                      Job Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Target className="mt-0.5 h-4 w-4 text-gold" />
                        <div>
                          <p className="text-xs text-grey">Core Need</p>
                          <p className="text-sm text-cream">{jobAnalysis.coreNeed}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="mt-0.5 h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-xs text-grey">Budget</p>
                          <p className="text-sm text-cream">{jobAnalysis.budget}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MessageSquare className="mt-0.5 h-4 w-4 text-blue-400" />
                        <div>
                          <p className="text-xs text-grey">Client Tone</p>
                          <p className="text-sm text-cream">{jobAnalysis.clientTone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="mt-0.5 h-4 w-4 text-gold" />
                        <div>
                          <p className="text-xs text-grey">Win Angle</p>
                          <p className="text-sm text-cream">{jobAnalysis.winAngle}</p>
                        </div>
                      </div>
                      {jobAnalysis.redFlags.length > 0 && (
                        <div className="flex items-start gap-3 sm:col-span-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-400" />
                          <div>
                            <p className="text-xs text-grey">Red Flags</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {jobAnalysis.redFlags.map((flag, i) => (
                                <Badge key={i} variant="warning" className="text-xs">
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gold" />
                Proposal History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length > 0 ? (
                <div className="space-y-3">
                  {proposals.map(proposal => (
                    <div
                      key={proposal.id}
                      className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-gold/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="gold">{proposal.platform || 'other'}</Badge>
                            <Badge>{proposal.tone || 'professional'}</Badge>
                            <Badge variant="default">{proposal.word_count} words</Badge>
                            <span className="text-xs text-grey">{formatDate(proposal.created_at)}</span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-cream">
                            {proposal.job_post}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(proposal.id, proposal.is_favorite)}
                            className="text-grey hover:text-gold transition-colors"
                          >
                            {proposal.is_favorite ? (
                              <Star className="h-5 w-5 fill-gold text-gold" />
                            ) : (
                              <StarOff className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => setExpandedProposal(
                              expandedProposal === proposal.id ? null : proposal.id
                            )}
                            className="text-grey hover:text-cream transition-colors"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteProposal(proposal.id)}
                            className="text-grey hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      {expandedProposal === proposal.id && (
                        <div className="mt-4 animate-fade-in">
                          <div className="rounded-lg border border-border bg-surface p-4">
                            <p className="whitespace-pre-wrap text-sm text-cream">
                              {proposal.generated_proposal}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            className="mt-3 gap-2"
                            onClick={async () => {
                              await navigator.clipboard.writeText(proposal.generated_proposal)
                              addToast('Copied to clipboard!', 'success')
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-grey" />
                  <p className="text-grey">No proposals yet</p>
                  <p className="text-sm text-grey">Your generated proposals will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-gold" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-cream">Full Name</label>
                  <Input
                    value={profileForm.full_name}
                    onChange={e => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-cream">Title</label>
                  <Input
                    value={profileForm.title}
                    onChange={e => setProfileForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Full-Stack Developer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-cream">Bio / Experience</label>
                <Textarea
                  value={profileForm.bio}
                  onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell clients about your experience..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-cream">Hourly Rate ($)</label>
                <Input
                  type="number"
                  value={profileForm.hourly_rate}
                  onChange={e => setProfileForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="75"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-cream">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {profileForm.skills.map(skill => (
                    <Badge key={skill} variant="gold" className="gap-1">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button variant="secondary" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-cream">Portfolio Links</label>
                <div className="space-y-2">
                  {profileForm.portfolio_links.map(link => (
                    <div key={link} className="flex items-center gap-2">
                      <Input value={link} disabled className="flex-1" />
                      <Button variant="ghost" size="icon" onClick={() => removeLink(link)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLink}
                    onChange={e => setNewLink(e.target.value)}
                    placeholder="https://..."
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
                  />
                  <Button variant="secondary" onClick={addLink}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-cream">Preferred Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setProfileForm(prev => ({ ...prev, preferred_tone: t.value }))}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                        profileForm.preferred_tone === t.value
                          ? 'bg-gold text-background'
                          : 'bg-surface text-grey hover:text-cream'
                      )}
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={saveProfile}
                loading={isSaving}
                className="gap-2"
              >
                {profileSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
