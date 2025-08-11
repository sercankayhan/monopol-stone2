'use client'

import ProductImage from '@/components/ProductImage'
import FloatingButtons from '@/components/FloatingButtons'
import AnimatedProductCard from '@/components/AnimatedProductCard'
// import PDFCatalog from '@/components/PDFCatalog'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'

export default function ProductsPage() {
  const cultureStones = [
    {
      id: 1,
      title: 'Mitra',
      description: 'Natural stone look cultured stone models for wall cladding. Affordable prices with m2 pricing.',
      images: [
        '/images/webp-optimized/mitra-gölge.jpg',
        '/images/webp-optimized/mitra-sis.jpg',
        '/images/webp-optimized/mitra-toprak.jpg',
        '/images/webp-optimized/mitra-antrasit.jpg',
      ],
      category: 'cultured-stone'
    },
    {
      id: 2,
      title: 'Luminar',
      description: 'Modern design cultured stone models. Ideal for indoor and outdoor applications.',
      images: [
        '/images/webp-optimized/luminar-gölge.jpg',
        '/images/webp-optimized/luminar-sis.jpg',
        '/images/webp-optimized/luminar-toprak.jpg',
        '/images/webp-optimized/luminar-antrasit.jpg',
      ],
      category: 'cultured-stone'
    },
    {
      id: 3,
      title: 'Belezza',
      description: 'Classic look cultured stone models. Special design for villa and residential projects.',
      images: [
        '/images/webp-optimized/belezza-günbatımı.jpg',
        '/images/webp-optimized/belezza-yıldız.jpg',
      ],
      category: 'cultured-stone'
    },
    {
      id: 4,
      title: 'Arvion',
      description: 'Rustic look cultured stone models. Special for country house and natural living projects.',
      images: [
        '/images/webp-optimized/arvion-gölge.jpg',
        '/images/webp-optimized/arvion-sis.jpg',
        '/images/webp-optimized/arvion-toprak.jpg',
        '/images/webp-optimized/arvion-antrasit.jpg',
      ],
      category: 'cultured-stone'
    },
    {
      id: 5,
      title: 'Tivoli',
      description: 'Luxury and premium cultured stone models. For special projects and villa applications.',
      images: [
        '/images/webp-optimized/tivoli-gölge.jpg',
        '/images/webp-optimized/tivoli-sis.jpg',
        '/images/webp-optimized/tivoli-toprak.jpg',
        '/images/webp-optimized/tivoli-antrasit.jpg',
      ],
      category: 'cultured-stone'
    }
  ]

  const cultureBricks = [
    {
      id: 6,
      title: 'Leon',
      description: 'Leon series cultured brick models. Ideal for modern and classic projects.',
      images: [
        '/images/webp-optimized/leon-inci.jpg',
        '/images/webp-optimized/leon-çakıl.jpg',
        '/images/webp-optimized/leon-çöl 1.jpg',
        '/images/webp-optimized/leon-köz.jpg',
        '/images/webp-optimized/leon-lav.jpg',
        '/images/webp-optimized/leon-mix.jpg',
      ],
      category: 'cultured-brick'
    },
    {
      id: 7,
      title: 'Leila',
      description: 'Leila series cultured brick models. Stands out with different colors and textures.',
      images: [
        '/images/webp-optimized/leila-inci.jpg',
        '/images/webp-optimized/leila-çakıl.jpg',
        '/images/webp-optimized/leila-çol 1.jpg',
        '/images/webp-optimized/leila-köz.jpg',
        '/images/webp-optimized/leila-lav.jpg',
        '/images/webp-optimized/leila-mix.jpg',
      ],
      category: 'cultured-brick'
    },
    {
      id: 8,
      title: 'Lora',
      description: 'Lora series cultured brick models. Offers aesthetic and durable solutions.',
      images: [
        '/images/webp-optimized/lora-inci.jpg',
        '/images/webp-optimized/lora-çakıl.jpg',
        '/images/webp-optimized/lora-çöl 1.jpg',
        '/images/webp-optimized/lora-köz.jpg',
        '/images/webp-optimized/lora-lav.jpg',
        '/images/webp-optimized/lora-mix.jpg',
      ],
      category: 'cultured-brick'
    }
  ]

  return (
    <main>
      <Breadcrumb />
      
      {/* PDF Catalog Section */}
      <section className="pdf-catalog" id="catalog">
        <div className="container">
          {/* PDFCatalog bileşeni geçici olarak devre dışı */}
        </div>
      </section>
      
      {/* Products Section */}
      <section className="products" id="products">
        <div className="container">
          <h2 className="section-title">Our Products</h2>

          {/* Culture Stones */}
          <h3 className="section-title" style={{ fontSize: '2rem', marginBottom: 32 }}>CULTURED STONES</h3>
          <div className="product-grid-premium">
            {cultureStones.map((product) => (
              <AnimatedProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                images={product.images}
                link={`/en/product/culture-stone-${product.id}`}
              />
            ))}
          </div>

          {/* Culture Bricks */}
          <h3 className="section-title" style={{ fontSize: '2rem', margin: '48px 0 32px 0' }}>CULTURED BRICKS</h3>
          <div className="product-grid-premium">
            {cultureBricks.map((product) => (
              <AnimatedProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                images={product.images}
                link={`/en/product/culture-brick-${product.id - 5}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 