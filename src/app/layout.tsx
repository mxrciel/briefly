import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Briefly — AI Proposal Writer for Freelancers',
  description: 'Write winning proposals in 10 seconds. Paste any job post, get a personalized proposal instantly.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
