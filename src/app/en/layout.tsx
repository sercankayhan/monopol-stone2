import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Monopol Stone - Artificial Stone & Wall Cladding',
  description: 'High-quality artificial stone and decorative wall cladding products. Professional solutions for offices, cafes, and schools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <Header />
        <Breadcrumb />
        {children}
        <Footer />
      </body>
    </html>
  )
} 