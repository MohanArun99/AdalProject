import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PixelDiff — Catch Visual Regressions Before Your Users Do',
  description: 'Upload two screenshots, get instant pixel-level comparison with AI-powered difference detection. Built for QA teams, designers, and developers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
