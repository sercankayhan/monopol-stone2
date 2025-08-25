'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Loading from './Loading'
import { useErrorHandling } from '@/hooks/useErrorHandling'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

export default function HeroSlider() {
  const pathname = usePathname()
  const [isEn, setIsEn] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadedImages, setLoadedImages] = useState(0)

  const { handleError } = useErrorHandling({
    enableLogging: true,
    onError: (error) => {
      console.error('HeroSlider error:', error);
    }
  });

  const { measureResourceLoad, measureUserInteraction } = usePerformanceMonitoring('HeroSlider');

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
    setIsEn(pathname.startsWith('/en'))
  }, [pathname])
  
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    '/header/urun1-optimized.jpg',
    '/header/urun2-optimized.jpg',
    '/header/urun3-optimized.jpg'
  ]

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      try {
        const imagePromises = slides.map((src, index) => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              measureResourceLoad(src, 'image');
              setLoadedImages(prev => {
                const newCount = prev + 1;
                if (newCount === slides.length) {
                  setImagesLoaded(true);
                }
                return newCount;
              });
              resolve();
            };
            img.onerror = () => {
              handleError(new Error(`Failed to load hero image: ${src}`), { imageIndex: index });
              reject();
            };
            img.src = src;
          });
        });

        await Promise.allSettled(imagePromises);
      } catch (error) {
        handleError(error as Error, { component: 'HeroSlider', action: 'loadImages' });
      }
    };

    if (isClient) {
      loadImages();
    }
  }, [isClient, slides, measureResourceLoad, handleError]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // 5 saniyede bir değişir

    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    const endMeasurement = measureUserInteraction('hero_next_click');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    endMeasurement();
  }

  const prevSlide = () => {
    const endMeasurement = measureUserInteraction('hero_prev_click');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    endMeasurement();
  }

  const handleDotClick = (index: number) => {
    const endMeasurement = measureUserInteraction('hero_dot_click');
    setCurrentSlide(index);
    endMeasurement();
  }

  // Show loading state
  if (!isClient || !imagesLoaded) {
    return (
      <section className="hero-slider">
        <div style={{
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
        }}>
          <Loading 
            size="large" 
            type="pulse" 
            text={`Resimler yükleniyor... (${loadedImages}/${slides.length})`}
          />
          
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '8px 16px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: '200px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(loadedImages / slides.length) * 100}%`,
                height: '100%',
                background: '#FD7E14',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-slider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`slider-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url("${slide}")` }}
          >
            <div className="container">
              <div className="hero-content">
                <h1>MONOPOL STONE</h1>
                <p>
                  {isClient && isEn 
                    ? "We enhance your spaces with aesthetic and durability through our natural stone and artificial stone solutions. With Monopol Stone quality, we offer elegance and strength tailored to every project."
                    : "Doğal taş ve yapay taş çözümlerimizle mekanlarınıza estetik ve dayanıklılık katıyoruz. Monopol Stone kalitesiyle, her projeye özel şıklık ve sağlamlık sunuyoruz."
                  }
                </p>
                <Link href={isClient && isEn ? "/en/products" : "/urunler"}>
                  <button className="btn-primary">
                    {isClient && isEn ? "EXPLORE OUR PRODUCTS" : "ÜRÜNLERİMİZİ İNCELEYİN"}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slider Navigation Arrows */}
      <div className="slider-nav">
        <button className="slider-arrow slider-arrow-left" onClick={prevSlide}>
          ‹
        </button>
        <button className="slider-arrow slider-arrow-right" onClick={nextSlide}>
          ›
        </button>
      </div>
      
      <div className="slider-dots">
        {slides.map((_, index) => (
          <span 
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          ></span>
        ))}
      </div>
    </section>
  )
} 