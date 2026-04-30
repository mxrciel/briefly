# Briefly — AI-Powered Proposal Writer for Freelancers

## Concept & Vision

Briefly is a premium SaaS tool that transforms the tedious task of writing freelance proposals into a 10-second process. It feels like having a personal business ghostwriter who knows exactly what clients want to hear. The aesthetic is luxury tech — think Porsche meets Notion — dark, sophisticated, and effortlessly powerful.

## Design Language

### Aesthetic Direction
Dark luxury theme with gold accents — the visual equivalent of a premium business card. Minimalist but not cold; sleek but not sterile. Every interaction feels intentional and high-end.

### Color Palette
- **Background**: `#050505` (near-black)
- **Surface**: `#0a0a0a` (cards, elevated elements)
- **Border**: `#1a1a1a` (subtle separation)
- **Gold Accent**: `#c9a84c` (primary CTAs, highlights)
- **Purple Highlight**: `#7c5cbf` (secondary accents, badges)
- **Text Primary**: `#f5f0e8` (cream white)
- **Text Secondary**: `#6b6b6b` (grey)
- **Success**: `#4ade80`
- **Error**: `#f87171`

### Typography
- **Headings**: Playfair Display (serif, elegant, editorial)
- **Body**: Inter (clean, modern, highly readable)
- **Monospace**: JetBrains Mono (for code/technical elements)

### Spatial System
- Base unit: 4px
- Section padding: 80px-120px vertical
- Card padding: 24px-32px
- Gap between elements: 16px-24px
- Border radius: 8px (subtle) to 16px (cards)

### Motion Philosophy
- Transitions: 200-300ms ease-out
- Hover states: subtle lift (translateY -2px) + glow
- Loading states: smooth skeleton pulses
- Page transitions: fade-in with slight upward motion
- Staggered animations for grids (50ms delay between items)

### Visual Assets
- Icons: Lucide React (consistent, minimal line icons)
- Decorative: Subtle gradient overlays, gold glow effects
- No images on landing — typography and spacing create visual interest

## Layout & Structure

### Landing Page
1. **Nav**: Fixed, glassmorphism effect, logo left, links center, auth buttons right
2. **Hero**: Full viewport height, centered text, gold accent word, CTA below
3. **Demo Section**: Two-column layout (input left, output right), interactive
4. **How It Works**: Three-step horizontal flow with numbered badges
5. **Features Grid**: 2x3 grid of feature cards with icons
6. **Pricing**: Three-tier cards, middle (Pro) highlighted as recommended
7. **Footer**: Minimal, centered copyright

### Auth Pages (Login/Signup)
- Centered card layout on dark background
- Logo at top
- OAuth button (Google) with icon
- Divider with "or continue with email"
- Form fields with floating labels
- CTA button full-width
- Secondary link at bottom

### Dashboard
- Left sidebar (collapsible on mobile) with navigation
- Top bar with usage counter and user menu
- Main content area with tabs (Generate, History, Profile)
- Responsive: sidebar becomes bottom nav on mobile

## Features & Interactions

### Landing Page
- **Hero CTA**: Scrolls to pricing or opens signup modal
- **Demo Section**: 
  - Paste job post → "Generate" button
  - Shows loading spinner for 2 seconds (simulated)
  - Displays sample proposal in output panel
  - Copy button copies to clipboard with success toast
- **Pricing Cards**: Hover lifts card, clicking opens checkout flow

### Authentication
- **Google OAuth**: Redirects to Google, returns to dashboard
- **Email/Password**: 
  - Real-time validation (email format, password min 8 chars)
  - Loading state on submit button
  - Error messages inline below fields
  - Success redirects to dashboard
- **Signup**: Auto-creates profile in Supabase

### Dashboard — Generate Tab
- **Job Post Input**: 
  - Auto-expanding textarea
  - Character count
  - Placeholder with example
- **Platform Dropdown**: Upwork, Fiverr, LinkedIn, Reddit, Other
- **Tone Selector**: 
  - 5 emoji buttons in a row
  - Selected state: gold border + background
  - Hover: subtle glow
- **Generate Button**:
  - Full-width, gold background
  - Loading state: spinner + "Generating..."
  - Disabled when input empty
- **Output Panel**:
  - Word count badge in corner
  - Copy button top-right
  - Smooth reveal animation on generation
  - Empty state: placeholder text
- **Job Analysis Card**:
  - 5 metrics in a horizontal scroll on mobile
  - Each metric: icon + label + value
  - Color-coded (green for positive, yellow for neutral, red for concerns)

### Dashboard — History Tab
- **Filter Bar**: All, Favorites, by Platform, by Tone
- **Proposal Cards**:
  - Date, platform badge, tone badge
  - Word count
  - Favorite star toggle (gold when active)
  - Click to expand full proposal
- **Expanded View**:
  - Full proposal text
  - Copy button
  - "Use Again" button (loads into generator)
  - Delete button with confirmation

### Dashboard — Profile Tab
- **Avatar Upload**: Circular, gold border
- **Form Fields**:
  - Name, Title, Bio (textarea)
  - Hourly Rate (number input with $ prefix)
  - Skills (tag input: type + Enter to add, click to remove)
  - Portfolio Links (url input + add button)
- **Preferred Tone Selector**: Same as generator but persistent
- **Save Button**: 
  - Shows "Saved" checkmark on success
  - Auto-saves on significant field blur

### Usage Limits
- Free users: 5 proposals/month
- Counter shows "3/5" in nav
- When hitting limit:
  - Generate button becomes "Upgrade to Pro"
  - Toast notification explains limit
  - Click redirects to pricing

### Stripe Integration
- "Upgrade" buttons open Stripe Checkout
- Success redirects to dashboard with success toast
- Webhook updates profile plan
- Customer portal for billing management

## Component Inventory

### Button
- **Variants**: primary (gold), secondary (outline), ghost
- **States**: default, hover (lift + glow), active (pressed), disabled (opacity 50%), loading (spinner)
- **Sizes**: sm, md, lg

### Input
- **States**: default (dark bg, subtle border), focus (gold border + glow), error (red border), disabled
- **Types**: text, email, password (with show/hide toggle), textarea, number

### Select/Dropdown
- **States**: default, open (gold border), disabled
- Custom styled to match theme

### Card
- **Variants**: default (dark surface), elevated (slight shadow), interactive (hover lift)
- Border radius 12px

### Badge
- **Variants**: platform (colored by platform), tone (emoji + text), status (success/error)
- Pill shape, small text

### Modal
- **States**: closed, open (backdrop blur + fade)
- **Sizes**: sm (400px), md (500px), lg (700px)

### Toast
- **Variants**: success (green), error (red), info (blue), warning (yellow)
- Auto-dismiss after 4 seconds
- Stack from bottom-right

### Skeleton
- Animated pulse effect
- Matches shape of content being loaded

### Tabs
- Underline style with gold indicator
- Smooth slide animation on switch

## Technical Approach

### Framework
- Next.js 14 with App Router
- TypeScript throughout
- Tailwind CSS v4 for styling

### Authentication
- Supabase Auth with email/password and Google OAuth
- JWT stored in HTTP-only cookies
- Middleware protects /dashboard routes
- Client-side auth state with Supabase client

### Database (Supabase/PostgreSQL)
See schema in main spec — RLS policies enforce data isolation.

### API Routes
- `/api/auth/[...nextauth]` — NextAuth handlers
- `/api/generate` — OpenAI proposal generation
- `/api/webhook` — Stripe webhook handler
- `/api/usage` — Check/reset usage limits

### AI Integration
- OpenAI GPT-4o for all generation
- Structured output where possible (JSON for analysis)
- System prompts cached at module level
- Rate limiting: 10 requests/minute per user

### Stripe
- Checkout Sessions for upgrades
- Webhook verifies signature
- Subscription status synced to profile

### Environment Variables
```
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_TEAM_PRICE_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Design

### POST /api/generate
**Request:**
```json
{
  "action": "generate" | "followup" | "cover_letter" | "variants",
  "jobPost": "string",
  "platform": "upwork" | "fiverr" | "linkedin" | "reddit" | "other",
  "tone": "professional" | "casual" | "confident" | "friendly" | "technical",
  "userProfile": { ... },
  "originalProposal": "string (for followup)",
  "clientResponse": "string (for followup)"
}
```

**Response:**
```json
{
  "proposal": "string",
  "analysis": {
    "coreNeed": "string",
    "skillsRequired": ["string"],
    "budget": "string",
    "clientTone": "string",
    "redFlags": ["string"],
    "winAngle": "string"
  },
  "usageRemaining": 4
}
```

### POST /api/webhook
Handles: `checkout.session.completed`, `customer.subscription.deleted`

## Data Model

### profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  title TEXT,
  bio TEXT,
  skills TEXT[],
  hourly_rate NUMERIC,
  portfolio_links TEXT[],
  preferred_tone TEXT DEFAULT 'professional',
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  proposals_used INT DEFAULT 0,
  proposals_limit INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### proposals
```sql
CREATE TABLE proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles NOT NULL,
  job_post TEXT NOT NULL,
  job_url TEXT,
  platform TEXT,
  generated_proposal TEXT NOT NULL,
  tone TEXT,
  word_count INT,
  is_favorite BOOLEAN DEFAULT FALSE,
  was_sent BOOLEAN DEFAULT FALSE,
  got_response BOOLEAN DEFAULT FALSE,
  response_text TEXT,
  follow_up TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### templates
```sql
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
