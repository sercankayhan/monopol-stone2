'use client'

import AnimatedProductCard from '@/components/AnimatedProductCard'
import FloatingButtons from '@/components/FloatingButtons'
import Breadcrumb from '@/components/Breadcrumb'

export default function UrunlerPage() {
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
      <FloatingButtons />
      
      {/* Products Section */}
      <section className="products" id="urunler">
        <div className="container">
          <h2 className="section-title">Ürünlerimiz</h2>

          {/* Kültür Taşları */}
          <h3 className="section-title" style={{ fontSize: '2rem', marginBottom: 32 }}>KÜLTÜR TAŞLARI</h3>
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

          {/* Kültür Tuğlaları */}
          <h3 className="section-title" style={{ fontSize: '2rem', margin: '48px 0 32px 0' }}>KÜLTÜR TUĞLALARI</h3>
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