'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface AnimatedProductCardProps {
  id: number
  title: string
  description: string
  images: string[]
  link: string
}

export default function AnimatedProductCard({ id, title, description, images, link }: AnimatedProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Her ürün için farklı başlangıç indeksi (rastgele görünüm için)
  useEffect(() => {
    if (!images || images.length <= 1) return

    // Ürün ID'sine göre farklı başlangıç indeksi
    const startIndex = (id % images.length)
    setCurrentImageIndex(startIndex)

    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      // 400ms sonra resmi değiştir
      setTimeout(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length)
        setIsTransitioning(false)
      }, 400)
    }, 4000)

    return () => clearInterval(interval)
  }, [images, id])

  return (
    <Link href={link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div 
        style={{ 
          cursor: 'pointer', 
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(0) scale(1)'
        }}
      >
        <div style={{ 
          position: 'relative', 
          overflow: 'hidden', 
          borderRadius: '8px 8px 0 0',
          height: '300px',
          backgroundColor: '#f5f5f5'
        }}>
          {/* Ana resim - Next.js Image component ile optimize edilmiş */}
          {images && images.length > 0 && (
            <Image 
              src={images[currentImageIndex]} 
              alt={`${title} - ${currentImageIndex + 1}`} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ 
                objectFit: 'cover',
                transition: 'opacity 0.4s ease-in-out',
                opacity: isTransitioning ? 0 : 1,
              }}
              quality={75}
              priority={currentImageIndex === 0}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              loading={currentImageIndex === 0 ? "eager" : "lazy"}
            />
          )}
          
          {/* Image counter - sadece birden fazla resim varsa göster */}
          {images && images.length > 1 && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              zIndex: 3,
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)'
            }}>
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          padding: '20px',
          backgroundColor: 'white',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: '#333',
            transition: 'color 0.3s ease'
          }}>
            {title}
          </div>
          <div style={{ 
            flex: 1, 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '15px',
            lineHeight: '1.6',
            transition: 'color 0.3s ease'
          }}>
            {description}
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#888',
            marginBottom: '15px',
            transition: 'color 0.3s ease'
          }}>
            <span>Yükseklik: 2" - 12"</span>
            <span>Uzunluk: 5" - 16"</span>
          </div>
          <button style={{ 
            padding: '12px 24px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'translateY(0)',
            boxShadow: '0 2px 4px rgba(231, 76, 60, 0.3)'
          }}>
            Detay
          </button>
        </div>
      </div>
    </Link>
  )
} 