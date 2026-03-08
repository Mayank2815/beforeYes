import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BeforeYes — Pre-Marriage Compatibility Intelligence',
  description: 'A private, session-based compatibility assessment for two partners. No accounts. No data stored beyond 72 hours.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_BASE_URL ?? 'https://beforeyes.in'),
  openGraph: {
    title: 'BeforeYes',
    description: 'Know your compatibility before you say yes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-brand-paper text-brand-ink antialiased font-body">
        {children}
      </body>
    </html>
  )
}
