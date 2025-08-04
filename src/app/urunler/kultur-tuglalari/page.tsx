'use client'

import ProductImage from '@/components/ProductImage'
import FloatingButtons from '@/components/FloatingButtons'
import AnimatedProductCard from '@/components/AnimatedProductCard'
import Link from 'next/link'
import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb'

export default function KulturTuglalariPage() {
  const cultureBricks = [
    {
      id: 6,
      title: 'Leon',
      description: 'Leon serisi kültür tuğlası modelleri. Modern ve klasik projeler için ideal.',
      images: [
        '/images/webp-optimized/leon-inci.jpg',
        '/images/webp-optimized/leon-çakıl.jpg',
        '/images/webp-optimized/leon-çöl 1.jpg',
        '/images/webp-optimized/leon-köz.jpg',
        '/images/webp-optimized/leon-lav.jpg',
        '/images/webp-optimized/leon-mix.jpg',
      ]
    },
    {
      id: 7,
      title: 'Leila',
      description: 'Leila serisi kültür tuğlası modelleri. Farklı renk ve dokularıyla dikkat çeker.',
      images: [
        '/images/webp-optimized/leila-inci.jpg',
        '/images/webp-optimized/leila-çakıl.jpg',
        '/images/webp-optimized/leila-çol 1.jpg',
        '/images/webp-optimized/leila-köz.jpg',
        '/images/webp-optimized/leila-lav.jpg',
        '/images/webp-optimized/leila-mix.jpg',
      ]
    },
    {
      id: 8,
      title: 'Lora',
      description: 'Lora serisi kültür tuğlası modelleri. Estetik ve dayanıklı çözümler sunar.',
      images: [
        '/images/webp-optimized/lora-inci.jpg',
        '/images/webp-optimized/lora-çakıl.jpg',
        '/images/webp-optimized/lora-çöl 1.jpg',
        '/images/webp-optimized/lora-köz.jpg',
        '/images/webp-optimized/lora-lav.jpg',
        '/images/webp-optimized/lora-mix.jpg',
      ]
    }
  ]

  return (
    <main>
      <Breadcrumb />
      {/* Products Section */}
      <section className="products" id="urunler">
        <div className="container">
          <h2 className="section-title">Kültür Tuğlaları</h2>
          <div className="product-grid-premium">
            {cultureBricks.map((product) => (
              <AnimatedProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                images={product.images}
                link={`/urun/kultur-tuglasi-${product.id - 5}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 