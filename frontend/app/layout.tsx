import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PhotoGen — Free Passport Photo Maker',
  description: 'Create compliant passport and ID photos for free. AI-powered background removal, face detection, and auto-cropping for 10+ countries.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
