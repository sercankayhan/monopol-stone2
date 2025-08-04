'use client'

import { useState } from 'react'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  fallbackText?: string
}

export default function ProductImage({ src, alt, className, fallbackText }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(`https://via.placeholder.com/300x250?text=${fallbackText || alt}`)
    }
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
} 