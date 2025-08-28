import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/responsive-foundation.css'
import '@/styles/responsive-typography.css'
import '@/styles/responsive-grid.css'
import '@/styles/touch-gestures.css'
import '@/styles/performance-monitor.css'
import '@/styles/responsive-animations.css'
import '@/styles/test-dashboard.css'
import '@/styles/rollback-dashboard.css'
import '@/styles/migration-dashboard.css'
import '@/styles/safeguards-dashboard.css'
import '@/styles/maintenance-dashboard.css'
import '@/styles/metrics-dashboard.css'
import '@/styles/checklist-dashboard.css'
import '@/styles/deployment-dashboard.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'
import PerformanceProvider from '@/components/PerformanceProvider'
import ResourceHints, { CriticalCSS, CRITICAL_CSS } from '@/components/ResourceHints'
import '@/utils/serviceWorker'

export const metadata: Metadata = {
  title: 'Monopol Stone - Tuğla Kaplama, Dekoratif Kültür Taşı, Ahşap Duvar Panelleri, Doğal Taş Kaplama',
  description: 'Tuğla kaplama, dekoratif kültür taşı, ahşap duvar panelleri, doğal taş kaplama, tas duvar kaplama, dekoratif tuğla modelleri, villa cephe tas kaplama, iç mekan tas duvar kaplama, ofis dekorasyonu, cafe dekorasyonu. m2 fiyatları ile kaliteli ürünler.',
  keywords: 'tuğla kaplama, tuğla duvar kaplama, dekoratif kültür taşı, ahşap duvar panelleri, doğal taş kaplama, tas duvar kaplama, dekoratif tuğla, villa cephe tas kaplama, iç mekan tas duvar kaplama, tas kaplama m2 fiyatları, kültür taşı fiyatları, dekoratif taş modelleri, dış cephe tas kaplama, ahşap panel fiyatı, tas duvar modelleri, yapay taş kaplama, ofis dekorasyonu, cafe dekorasyonu, okul dekorasyonu, mimarlık, mimari restorasyon',
  icons: {
    icon: '/siyahlogo.png',
    shortcut: '/siyahlogo.png',
    apple: '/siyahlogo.png',
  },
  openGraph: {
    title: 'Monopol Stone - Tuğla Kaplama, Dekoratif Kültür Taşı ve Ahşap Duvar Panelleri',
    description: 'Tuğla kaplama, dekoratif kültür taşı, ahşap duvar panelleri ve doğal taş kaplama ürünleri. Ofis, cafe, okul dekorasyonu için profesyonel çözümler. m2 fiyatları ile uygun fiyatlar.',
    type: 'website',
    locale: 'tr_TR',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Monopol Stone',
  },
  formatDetection: {
    telephone: true,
    date: false,
    address: true,
    email: true,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'HandheldFriendly': 'True',
    'MobileOptimized': '320',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#FD7E14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <CriticalCSS css={CRITICAL_CSS} />
        <ResourceHints />
        <PerformanceProvider>
          <ErrorBoundary>
            <Header />
            {children}
            <Footer />
          </ErrorBoundary>
        </PerformanceProvider>
      </body>
    </html>
  )
} 