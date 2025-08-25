'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HeroSlider() {
  const pathname = usePathname()
  const [isEn, setIsEn] = useState(false)
  const [isClient, setIsClient] = useState(false)

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
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
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
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </section>
  )
} 