'use client'

import ProductImage from '@/components/ProductImage'
import FloatingButtons from '@/components/FloatingButtons'
import HeroSlider from '@/components/HeroSlider'
import Link from 'next/link'

export default function HomeEn() {
  const cultureStones = [
    {
      id: 1,
      title: 'Mitra',
      description: 'Natural stone-look culture stone models for wall cladding. Affordable prices with m2 pricing.',
      image: '/images/optimized/mitra-gölge.jpg'
    },
    {
      id: 2,
      title: 'Luminar',
      description: 'Modern design culture stone models. Ideal for indoor and outdoor applications.',
      image: '/images/optimized/luminar-gölge.jpg'
    },
    {
      id: 3,
      title: 'Belezza',
      description: 'Classic-looking culture stone models. Special design for villa and residential projects.',
      image: '/images/optimized/belezza-günbatımı.jpg'
    },
    {
      id: 4,
      title: 'Arvion',
      description: 'Rustic-looking culture stone models. Special for country house and natural living projects.',
      image: '/images/optimized/arvion-gölge.jpg'
    },
    {
      id: 5,
      title: 'Tivoli',
      description: 'Luxury and premium culture stone models. For special projects and villa applications.',
      image: '/images/optimized/tivoli-gölge.jpg'
    }
  ]

  const cultureBricks = [
    {
      id: 6,
      title: 'CULTURE BRICK 1',
      description: 'Antique-looking culture brick models. Special design for period architecture.',
      image: '/images/optimized/leon-inci.jpg'
    },
    {
      id: 7,
      title: 'CULTURE BRICK 2',
      description: 'Modern and elegant culture brick models. Ideal for contemporary architectural projects.',
      image: '/images/optimized/leila-inci.jpg'
    },
    {
      id: 8,
      title: 'CULTURE BRICK 3',
      description: 'Industrial-looking culture brick models. For loft and modern office projects.',
      image: '/images/optimized/lora-inci.jpg'
    }
  ]

  const features = [
    {
      icon: '🔥',
      title: 'HEAT RESISTANCE',
      description: 'Resistant to external factors.'
    },
    {
      icon: '❄️',
      title: 'COLD RESISTANCE',
      description: 'Resistant to external factors.'
    },
    {
      icon: '🌿',
      title: 'NATURAL PATTERN',
      description: 'Inspired by nature.'
    },
    {
      icon: '🌱',
      title: 'ECO-FRIENDLY',
      description: 'Environmentally conscious, sustainable production.'
    },
    {
      icon: '✅',
      title: 'HEALTHY',
      description: 'No carcinogenic substances.'
    },
    {
      icon: '⏰',
      title: 'ON-TIME DELIVERY',
      description: 'We ensure timely delivery.'
    },
    {
      icon: '🔧',
      title: 'EASY INSTALLATION',
      description: 'Easy and practical application.'
    }
  ]

  return (
    <main>
      <FloatingButtons />
      
      <HeroSlider />

      {/* Products Section */}
      <section className="products" id="products">
        <div className="container">
          <h2 className="section-title">Our Products</h2>
          
          {/* Culture Stones */}
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{ 
              fontSize: '2rem', 
              marginBottom: '30px', 
              color: '#fff',
              textAlign: 'center',
              borderBottom: '3px solid #e74c3c',
              paddingBottom: '10px',
              display: 'inline-block',
              width: '100%'
            }}>
              CULTURE STONES
            </h3>
            <div className="product-grid">
              {cultureStones.map((product) => (
                <Link key={product.id} href={`/en/product/culture-stone-${product.id}`} style={{ textDecoration: 'none' }}>
                  <div className="product-card">
                    <ProductImage 
                      src={product.image} 
                      alt={product.title}
                      className="product-image"
                      fallbackText={product.title}
                    />
                    <div className="product-content">
                      <h3 className="product-title">{product.title}</h3>
                      <p className="product-description">{product.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Culture Bricks */}
          <div>
            <h3 style={{ 
              fontSize: '2rem', 
              marginBottom: '30px', 
              color: '#fff',
              textAlign: 'center',
              borderBottom: '3px solid #e74c3c',
              paddingBottom: '10px',
              display: 'inline-block',
              width: '100%'
            }}>
              CULTURE BRICKS
            </h3>
            <div className="product-grid">
              {cultureBricks.map((product) => (
                <div key={product.id} className="product-card">
                  <ProductImage 
                    src={product.image} 
                    alt={product.title}
                    className="product-image"
                    fallbackText={product.title}
                  />
                  <div className="product-content">
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-description">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="differences">
        <div className="container">
          <h2 className="section-title">Our Differences</h2>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: '80px 0', background: '#f8f9fa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#fff' }}>
              Monopol Stone History
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#666' }}>
              Monopol Stone is passionately produced to offer superior quality original products in brick cladding, 
              decorative culture stone, wooden wall panels, natural stone cladding and wall cladding. 
              We add value to your spaces with our villa facade cladding, interior wall cladding, 
              office decoration, cafe decoration and exterior facade cladding solutions.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
} 