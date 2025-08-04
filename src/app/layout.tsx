import type { Metadata } from 'next'
import '@/styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
  other: {
    'charset': 'utf-8',
    'Content-Type': 'text/html; charset=utf-8',
  },
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
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
} 