import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme-provider'
import { PublicMobileHistorySeed } from '@/components/app/public-mobile-history-seed'
import PollarProviderClient from '@/components/providers/pollar-provider-client'
import { getSiteUrl } from '@/app/site-config'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const siteUrl = getSiteUrl()
const defaultTitle = 'Seyf — Gasta ahora y nunca pagues'
const defaultDescription =
  'Bonos, liquidez y tarjeta en pesos mexicanos. Adelanta rendimientos, protege tu capital y opera con custodia Stellar vía Pollar.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s · Seyf',
  },
  description: defaultDescription,
  applicationName: 'Seyf',
  keywords: ['Seyf', 'bonos', 'CETES', 'México', 'ahorro', 'liquidez', 'Stellar', 'Pollar'],
  authors: [{ name: 'Seyf' }],
  creator: 'Seyf',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: siteUrl,
    siteName: 'Seyf',
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: '/og.png',
        width: 1536,
        height: 1024,
        alt: 'Seyf — bonos y liquidez en pesos mexicanos',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Seyf' }],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8f5f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0d3531' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()
  return (
    <html lang="es-MX" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <PublicMobileHistorySeed />
            <PollarProviderClient>{children}</PollarProviderClient>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
