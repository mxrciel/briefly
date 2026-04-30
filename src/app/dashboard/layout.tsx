import { redirect } from 'next/navigation'
import { createClient } from '~/lib/supabase/server'
import { ToastProvider } from '~/components/ui/toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-surface hidden lg:block">
          <div className="flex h-16 items-center border-b border-border px-6">
            <a href="/" className="flex items-center gap-2">
              <svg className="h-8 w-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span className="font-playfair text-xl font-bold text-cream">Briefly</span>
            </a>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-1">
              <li>
                <a href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gold bg-gold/10">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  Generate
                </a>
              </li>
              <li>
                <a href="/dashboard?tab=history" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-grey hover:bg-surface/50 hover:text-cream transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  History
                </a>
              </li>
              <li>
                <a href="/dashboard?tab=profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-grey hover:bg-surface/50 hover:text-cream transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profile
                </a>
              </li>
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
            <div className="mb-4 rounded-lg bg-background/50 p-3">
              <div className="text-xs text-grey">Usage this month</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gold">3</span>
                <span className="text-grey">/ 5</span>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" className="w-full rounded-lg px-3 py-2 text-sm font-medium text-grey hover:bg-surface/50 hover:text-cream transition-colors text-left">
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-xl lg:hidden">
          <a href="/" className="flex items-center gap-2 px-4">
            <svg className="h-6 w-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span className="font-playfair text-lg font-bold">Briefly</span>
          </a>
          <div className="px-4">
            <div className="flex items-center gap-1 rounded-full bg-background/50 px-3 py-1">
              <span className="text-sm font-medium text-gold">3</span>
              <span className="text-sm text-grey">/5</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="pt-16 lg:pt-0">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/80 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-around">
            <a href="/dashboard" className="flex flex-col items-center gap-1 text-gold">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span className="text-xs">Generate</span>
            </a>
            <a href="/dashboard?tab=history" className="flex flex-col items-center gap-1 text-grey">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span className="text-xs">History</span>
            </a>
            <a href="/dashboard?tab=profile" className="flex flex-col items-center gap-1 text-grey">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-xs">Profile</span>
            </a>
          </div>
        </nav>
      </div>
    </ToastProvider>
  )
}
