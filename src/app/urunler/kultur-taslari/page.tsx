'use client'

import ProductImage from '@/components/ProductImage'
import FloatingButtons from '@/components/FloatingButtons'
import AnimatedProductCard from '@/components/AnimatedProductCard'
import Link from 'next/link'
import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb'

export default function KulturTaslariPage() {
  const cultureStones = [
    {
      id: 1,
      title: 'Mitra',
      description: 'Doğal taş görünümlü kültür taşı modelleri ile duvar kaplama. m2 fiyatları ile uygun fiyatlar.',
      images: [
        '/images/webp-optimized/mitra-gölge.jpg',
        '/images/webp-optimized/mitra-sis.jpg',
        '/images/webp-optimized/mitra-toprak.jpg',
        '/images/webp-optimized/mitra-antrasit.jpg',
      ]
    },
    {
      id: 2,
      title: 'Luminar',
      description: 'Modern tasarım kültür taşı modelleri. İç ve dış mekan uygulamaları için ideal.',
      images: [
        '/images/webp-optimized/luminar-gölge.jpg',
        '/images/webp-optimized/luminar-sis.jpg',
        '/images/webp-optimized/luminar-toprak.jpg',
        '/images/webp-optimized/luminar-antrasit.jpg',
      ]
    },
    {
      id: 3,
      title: 'Belezza',
      description: 'Klasik görünümlü kültür taşı modelleri. Villa ve konut projeleri için özel tasarım.',
      images: [
        '/images/webp-optimized/belezza-günbatımı.jpg',
        '/images/webp-optimized/belezza-yıldız.jpg',
      ]
    },
    {
      id: 4,
      title: 'Arvion',
      description: 'Rustik görünümlü kültür taşı modelleri. Köy evi ve doğal yaşam projeleri için özel.',
      images: [
        '/images/webp-optimized/arvion-gölge.jpg',
        '/images/webp-optimized/arvion-sis.jpg',
        '/images/webp-optimized/arvion-toprak.jpg',
        '/images/webp-optimized/arvion-antrasit.jpg',
      ]
    },
    {
      id: 5,
      title: 'Tivoli',
      description: 'Lüks ve premium kültür taşı modelleri. Özel projeler ve villa uygulamaları için.',
      images: [
        '/images/webp-optimized/tivoli-gölge.jpg',
        '/images/webp-optimized/tivoli-sis.jpg',
        '/images/webp-optimized/tivoli-toprak.jpg',
        '/images/webp-optimized/tivoli-antrasit.jpg',
      ]
    }
  ]

  return (
    <main>
      <Breadcrumb />
      {/* Products Section */}
      <section className="products" id="urunler">
        <div className="container">
          <h2 className="section-title">Kültür Taşları</h2>
          <div className="product-grid-premium">
            {cultureStones.map((product) => (
              <AnimatedProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                images={product.images}
                link={`/urun/kultur-tasi-${product.id}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 