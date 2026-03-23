import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://photogen.io'

export const metadata: Metadata = {
  title: {
    default: 'PhotoGen - Free Passport Photo Maker Online | AI Passport Photo Generator',
    template: '%s | PhotoGen',
  },
  description:
    'Create compliant passport and ID photos for free. AI-powered background removal, face detection, and auto-cropping for US, UK, EU, Canada, Australia, India, Japan, Germany, and China. No signup required, no watermark.',
  keywords: [
    'passport photo maker',
    'free passport photo',
    'passport photo online',
    'ID photo maker',
    'visa photo maker',
    'passport photo background removal',
    'passport photo AI',
    'passport photo app',
    'make passport photo at home',
    'passport photo 2x2',
    'US passport photo online free',
    'UK passport photo maker',
    'Canada passport photo online',
    'EU visa photo maker',
    'passport photo no watermark',
    'passport photo crop tool',
    'remove background passport photo',
  ],
  openGraph: {
    title: 'PhotoGen - Free Passport Photo Maker',
    description:
      'Create compliant passport and ID photos instantly with AI. Background removal, face detection, auto-cropping for 9+ countries. 100% free, no signup.',
    url: SITE_URL,
    siteName: 'PhotoGen',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'PhotoGen - Free AI Passport Photo Maker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhotoGen - Free Passport Photo Maker',
    description:
      'AI-powered passport photos for free. No signup, no watermark, no data stored.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  metadataBase: new URL(SITE_URL),
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PhotoGen',
  url: SITE_URL,
  description:
    'Free AI-powered passport and ID photo maker. Background removal, face detection, and auto-cropping for US, UK, EU, Canada, and more.',
  applicationCategory: 'PhotographyApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'AI background removal',
    'Face detection',
    'Auto-cropping to official specs',
    'US, UK, EU, Canada, Australia, India, Japan, Germany, China support',
    'No watermark',
    'No signup required',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
