'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Textarea } from '~/components/ui/textarea'
import { cn, countWords } from '~/lib/utils'
import {
  Zap,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Clock,
  FileText,
  MessageSquare,
  Star,
  Layers,
  Brain,
  Target,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: 'Job-Specific',
    description: 'Every proposal is crafted for the exact job you\'re applying to',
  },
  {
    icon: MessageSquare,
    title: 'Tone Matching',
    description: 'Matches the client\'s communication style perfectly',
  },
  {
    icon: Brain,
    title: 'Job Analysis',
    description: 'Extracts budget, red flags, and winning angles automatically',
  },
  {
    icon: FileText,
    title: 'Follow-Up Writer',
    description: 'Turns client responses into compelling follow-ups',
  },
  {
    icon: Star,
    title: 'Cover Letters',
    description: 'Generate professional cover letters in seconds',
  },
  {
    icon: Layers,
    title: 'A/B Variants',
    description: 'Get multiple versions to test what wins',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Paste Job Post',
    description: 'Copy any job description from Upwork, Fiverr, or anywhere',
  },
  {
    number: '02',
    title: 'AI Writes',
    description: 'Our AI crafts a personalized proposal in seconds',
  },
  {
    number: '03',
    title: 'Copy & Send',
    description: 'One click to copy, then paste and submit',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: ['5 proposals/month', 'Basic tones', 'Job analysis', 'Email support'],
    limitations: ['Limited history', 'No favorites', 'No follow-ups'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 19,
    description: 'For serious freelancers',
    features: ['Unlimited proposals', 'All tones', 'History & favorites', 'Follow-up generator', 'Cover letters', 'A/B variants', 'Priority support'],
    limitations: [],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Team',
    price: 49,
    description: 'For agencies and teams',
    features: ['Everything in Pro', '3 team seats', 'Shared templates', 'Analytics dashboard', 'Team billing'],
    limitations: [],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const SAMPLE_PROPOSAL = `I noticed you're looking for someone to build a real-time dashboard with complex data visualizations. This is exactly the kind of project I love.

I've built similar dashboards for fintech startups using React and D3.js, with real-time updates via WebSockets. I can deliver a polished, performant solution that handles your data volume without breaking a sweat.

My approach: First, I'll create a detailed spec so we're aligned on every interaction. Then rapid iterations with demos every 2-3 days.

Ready to discuss your specific data sources and visualization needs? I can start tomorrow.`

const SAMPLE_JOB = `Looking for an experienced React developer to build a real-time analytics dashboard.

Requirements:
- Real-time data updates via WebSockets
- Complex charts and data visualizations (D3.js or similar)
- User authentication and role-based access
- Mobile responsive design
- Integration with our existing REST API

Budget: $2,000-3,000
Timeline: 2-3 weeks

Please share your portfolio and relevant experience with real-time data visualization projects.`

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [jobPost, setJobPost] = useState('')
  const [generatedProposal, setGeneratedProposal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!jobPost.trim()) return
    setIsGenerating(true)
    
    // Simulated AI response
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGeneratedProposal(SAMPLE_PROPOSAL)
    setIsGenerating(false)
  }

  const handleCopy = async () => {
    if (!generatedProposal) return
    await navigator.clipboard.writeText(generatedProposal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-gold" />
              <span className="font-playfair text-2xl font-bold text-cream">Briefly</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-8 md:flex">
              <Link href="#pricing" className="text-grey hover:text-cream transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-grey hover:text-cream transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mt-4 flex flex-col gap-4 md:hidden">
              <Link href="#pricing" className="text-grey hover:text-cream transition-colors">Pricing</Link>
              <Link href="/login" className="text-grey hover:text-cream transition-colors">Login</Link>
              <Link href="/signup">
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="gold" className="mb-6">
            <Zap className="mr-1 h-3 w-3" />
            AI-Powered Proposal Writing
          </Badge>
          
          <h1 className="font-playfair mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Write proposals that{' '}
            <span className="text-gold">win jobs</span>{' '}
            in 10 seconds
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-xl text-grey">
            Paste any job post. Get a personalized, winning proposal instantly.
            Stop losing gigs to bad proposals.
          </p>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free — No Card Needed
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="secondary" size="lg">
                See It In Action
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-playfair mb-4 text-4xl font-bold">Try It Now</h2>
            <p className="text-grey">Paste a job post below and see what Briefly can generate</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input */}
            <Card>
              <CardContent className="p-6">
                <label className="mb-2 block text-sm font-medium text-cream">
                  Paste Job Post
                </label>
                <Textarea
                  value={jobPost}
                  onChange={(e) => setJobPost(e.target.value)}
                  placeholder={SAMPLE_JOB}
                  className="min-h-[300px]"
                />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-grey">{jobPost.length} characters</span>
                  <Button
                    onClick={handleGenerate}
                    disabled={!jobPost.trim() || isGenerating}
                    loading={isGenerating}
                    className="gap-2"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Proposal'}
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-sm font-medium text-cream">Generated Proposal</label>
                  {generatedProposal && (
                    <Badge variant="gold">{countWords(generatedProposal)} words</Badge>
                  )}
                </div>
                <div className="min-h-[300px] rounded-lg border border-border bg-background p-4">
                  {generatedProposal ? (
                    <p className="whitespace-pre-wrap text-cream">{generatedProposal}</p>
                  ) : (
                    <p className="text-grey">Your generated proposal will appear here...</p>
                  )}
                </div>
                {generatedProposal && (
                  <div className="mt-4">
                    <Button onClick={handleCopy} variant="secondary" className="w-full gap-2">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-playfair mb-4 text-4xl font-bold">How It Works</h2>
            <p className="text-grey">Three simple steps to winning more jobs</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-gold bg-gold/10">
                  <span className="font-playfair text-2xl font-bold text-gold">{step.number}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-grey">{step.description}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="absolute -right-4 top-8 hidden text-gold md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-playfair mb-4 text-4xl font-bold">Everything You Need</h2>
            <p className="text-grey">Powerful features to help you win every job</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Card key={i} className="hover:border-gold/30 transition-all duration-200">
                <CardContent className="p-6">
                  <feature.icon className="mb-4 h-10 w-10 text-gold" />
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-grey">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-playfair mb-4 text-4xl font-bold">Simple Pricing</h2>
            <p className="text-grey">Start free, upgrade when you need more</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <Card
                key={i}
                className={cn(
                  'relative transition-all duration-200',
                  plan.highlight ? 'border-gold shadow-lg shadow-gold/10' : ''
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gold">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="mb-2 font-playfair text-2xl font-bold">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.price > 0 && <span className="text-grey">/month</span>}
                  </div>
                  <p className="mb-6 text-sm text-grey">{plan.description}</p>
                  
                  <div className="mb-6 space-y-2">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-gold" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-grey">
                        <X className="h-4 w-4" />
                        <span>{limitation}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href={plan.price === 0 ? '/signup' : '/signup?plan=pro'} className="block">
                    <Button
                      variant={plan.highlight ? 'primary' : 'secondary'}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-playfair mb-4 text-4xl font-bold">Stop losing gigs to bad proposals</h2>
          <p className="mb-8 text-lg text-grey">
            Join thousands of freelancers who are winning more jobs with AI-powered proposals
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Free Today
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-grey">
            © 2026 Briefly · Built by Martin Kibui Musyoki
          </p>
        </div>
      </footer>
    </div>
  )
}
