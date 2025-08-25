'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useErrorHandling } from '@/hooks/useErrorHandling'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
import Loading from './Loading'

interface Product {
  id: number
  title: string
  image: string
  description: string
  link: string
}

interface ProductSliderProps {
  products: Product[]
  title: string
}

export default function ProductSlider({ products, title }: ProductSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const { handleError, executeWithErrorHandling } = useErrorHandling({
    enableLogging: true,
    onError: (error) => {
      console.error('ProductSlider error:', error);
      setHasError(true);
    }
  });

  const { measureUserInteraction } = usePerformanceMonitoring('ProductSlider');

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length)
    }, 4000) // 4 saniyede bir değişir

    return () => clearInterval(interval)
  }, [products.length, isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // 5 saniye sonra otomatik oynatmayı tekrar başlat
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  return (
    <div className="product-slider-section">
      <h3 className="section-title" style={{ fontSize: '2rem', marginBottom: 32 }}>{title}</h3>
      
      <div className="product-slider-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
        <div 
          className="product-slider-track" 
          style={{ 
            display: 'flex', 
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: 'transform 0.5s ease-in-out',
            width: `${products.length * 100}%`
          }}
        >
          {products.map((product, index) => (
            <div 
              key={product.id}
              className="product-slide" 
              style={{ 
                width: `${100 / products.length}%`,
                padding: '0 15px',
                boxSizing: 'border-box'
              }}
            >
              <Link href={product.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card-premium" style={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="product-image-premium large" 
                      style={{ 
                        width: '100%', 
                        height: '300px', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    />
                  </div>
                  <div className="product-info-premium" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="product-title-premium">{product.title}</div>
                    <div className="product-description-premium" style={{ flex: 1 }}>{product.description}</div>
                    <div className="product-details-premium">
                      <span>Yükseklik: 2" - 12"</span>
                      <span>Uzunluk: 5" - 16"</span>
                    </div>
                    <button className="btn-premium">Detay</button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        {/* Slider Navigation Arrows */}
        <div className="slider-nav" style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between', padding: '0 20px', pointerEvents: 'none' }}>
          <button 
            className="slider-arrow slider-arrow-left" 
            onClick={prevSlide}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,1)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            ‹
          </button>
          <button 
            className="slider-arrow slider-arrow-right" 
            onClick={nextSlide}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,1)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            ›
          </button>
        </div>
        
        {/* Slider Dots */}
        <div className="slider-dots" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          marginTop: '20px',
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          {products.map((_, index) => (
            <span 
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: index === currentSlide ? '#FFA726' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(255,255,255,0.8)'
              }}
              onMouseEnter={(e) => {
                if (index !== currentSlide) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentSlide) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
                }
              }}
            ></span>
          ))}
        </div>
      </div>
    </div>
  )
} 