'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Breadcrumb from '@/components/Breadcrumb'

interface Product {
  title: string;
  description: string;
  image: string;
  colors: string[];
  technicalInfo: {
    [key: string]: string;
  };
  features?: string[];
  applications?: string[];
  code?: string;
  images?: {
    [key: string]: string;
  };
}

export default function ProductDetailEn() {
  const params = useParams()
  const slug = params.slug as string
  const [selectedColor, setSelectedColor] = useState('default')
  const [isImageLoading, setIsImageLoading] = useState(true)

  // Product data based on slug
  const getProductData = (slug: string): Product => {
    const products: { [key: string]: Product } = {
      'culture-stone-1': {
        title: 'Mitra',
        description: 'Natural stone-look culture stone models for wall cladding. Affordable prices with m2 pricing. Inspired by 19th century Cairo architecture, this stone model brings timeless elegance to any space.',
        image: '/images/optimized/mitra-gölge.jpg',
        code: 'BP-13001',
        images: {
          'shadow': '/images/optimized/mitra-gölge.jpg',
          'mist': '/images/optimized/mitra-sis.jpg',
          'earth': '/images/optimized/mitra-toprak.jpg',
          'anthracite': '/images/optimized/mitra-antrasit.jpg',
        },
        colors: ['Shadow', 'Mist', 'Earth', 'Anthracite'],
        technicalInfo: {
          'Thickness': '3-5 cm',
          'Weight': '45 kg/m²',
          'Application Area': 'Indoor/Outdoor',
          'Material': 'Cement-based',
          'Finish': 'Natural stone texture'
        },
        features: [
          'Natural stone appearance',
          'Easy installation',
          'Long-lasting',
          'Waterproof',
          'Thermal insulation',
          'Sound insulation'
        ],
        applications: [
          'Exterior wall cladding',
          'Interior wall decoration',
          'Fireplace surrounds',
          'Garden walls',
          'Terrace cladding',
          'Villa projects'
        ]
      },
      'culture-stone-2': {
        title: 'Luminar',
        description: 'Modern design culture stone models. Ideal for indoor and outdoor applications. Preferred choice in contemporary architectural projects.',
        image: '/images/optimized/luminar-gölge.jpg',
        code: 'BP-13002',
        images: {
          'shadow': '/images/optimized/luminar-gölge.jpg',
          'mist': '/images/optimized/luminar-sis.jpg',
          'earth': '/images/optimized/luminar-toprak.jpg',
          'anthracite': '/images/optimized/luminar-antrasit.jpg',
        },
        colors: ['Shadow', 'Mist', 'Earth', 'Anthracite'],
        technicalInfo: {
          'Thickness': '3-5 cm',
          'Weight': '45 kg/m²',
          'Application Area': 'Indoor/Outdoor',
          'Material': 'Cement-based',
          'Finish': 'Modern stone texture'
        },
        features: [
          'Modern design',
          'Easy installation',
          'Long-lasting',
          'Waterproof',
          'Thermal insulation',
          'Sound insulation'
        ],
        applications: [
          'Modern building facades',
          'Interior decoration',
          'Office projects',
          'Shopping mall facades',
          'Hotel projects',
          'Residential projects'
        ]
      },
      'culture-stone-3': {
        title: 'Belezza',
        description: 'Classic-looking culture stone models. Special design for villa and residential projects. Timeless beauty and quality.',
        image: '/images/optimized/belezza-günbatımı.jpg',
        code: 'BP-13003',
        images: {
          'sunset': '/images/optimized/belezza-günbatımı.jpg',
          'star': '/images/optimized/belezza-yıldız.jpg',
        },
        colors: ['Sunset', 'Star'],
        technicalInfo: {
          'Thickness': '3-5 cm',
          'Weight': '45 kg/m²',
          'Application Area': 'Indoor/Outdoor',
          'Material': 'Cement-based',
          'Finish': 'Classic stone texture'
        },
        features: [
          'Classic design',
          'Easy installation',
          'Long-lasting',
          'Waterproof',
          'Thermal insulation',
          'Sound insulation'
        ],
        applications: [
          'Villa facades',
          'Residential projects',
          'Garden walls',
          'Fireplace surrounds',
          'Terrace cladding',
          'Luxury projects'
        ]
      },
      'culture-stone-4': {
        title: 'Arvion',
        description: 'Rustic-looking culture stone models. Special for country house and natural living projects. Brings the warmth of nature to your spaces.',
        image: '/images/optimized/arvion-gölge.jpg',
        code: 'BP-13004',
        images: {
          'shadow': '/images/optimized/arvion-gölge.jpg',
          'mist': '/images/optimized/arvion-sis.jpg',
          'earth': '/images/optimized/arvion-toprak.jpg',
          'anthracite': '/images/optimized/arvion-antrasit.jpg',
        },
        colors: ['Shadow', 'Mist', 'Earth', 'Anthracite'],
        technicalInfo: {
          'Thickness': '3-5 cm',
          'Weight': '45 kg/m²',
          'Application Area': 'Indoor/Outdoor',
          'Material': 'Cement-based',
          'Finish': 'Rustic stone texture'
        },
        features: [
          'Rustic design',
          'Natural appearance',
          'Easy installation',
          'Long-lasting',
          'Waterproof',
          'Thermal insulation'
        ],
        applications: [
          'Country houses',
          'Natural living projects',
          'Garden walls',
          'Fireplace surrounds',
          'Terrace cladding',
          'Rustic projects'
        ]
      },
      'culture-stone-5': {
        title: 'Tivoli',
        description: 'Luxury and premium culture stone models. For special projects and villa applications. The choice of prestigious projects.',
        image: '/images/optimized/tivoli-gölge.jpg',
        code: 'BP-13005',
        images: {
          'shadow': '/images/optimized/tivoli-gölge.jpg',
          'mist': '/images/optimized/tivoli-sis.jpg',
          'earth': '/images/optimized/tivoli-toprak.jpg',
          'anthracite': '/images/optimized/tivoli-antrasit.jpg',
        },
        colors: ['Shadow', 'Mist', 'Earth', 'Anthracite'],
        technicalInfo: {
          'Thickness': '3-5 cm',
          'Weight': '45 kg/m²',
          'Application Area': 'Indoor/Outdoor',
          'Material': 'Cement-based',
          'Finish': 'Premium stone texture'
        },
        features: [
          'Premium design',
          'Luxury appearance',
          'Easy installation',
          'Long-lasting',
          'Waterproof',
          'Thermal insulation'
        ],
        applications: [
          'Luxury villa projects',
          'Premium residences',
          'Hotel projects',
          'Residential projects',
          'Special projects',
          'Prestigious buildings'
        ]
      }
    }
    return products[slug] || products['culture-stone-1']
  }

  const product = getProductData(slug)

  useEffect(() => {
    setIsImageLoading(true)
  }, [selectedColor])

  const getColorCode = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'Shadow': '#bfc3c6',
      'Mist': '#e3e6e8',
      'Earth': '#b49a7a',
      'Anthracite': '#222',
      'Sunset': '#d4a574',
      'Star': '#f5f5dc'
    }
    return colorMap[colorName] || '#ccc'
  }

  const getImageForColor = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'Shadow': 'shadow',
      'Mist': 'mist',
      'Earth': 'earth',
      'Anthracite': 'anthracite',
      'Sunset': 'sunset',
      'Star': 'star'
    }
    const imageKey = colorMap[colorName]
    return product.images?.[imageKey] || product.image
  }

  return (
    <div className="product-detail-page">
      <Breadcrumb />
      <div className="container">
        <div className="product-detail-layout">
          {/* Left: Product Image */}
          <div className="product-image-section">
            <div className="product-image-container">
              {isImageLoading && (
                <div className="image-loading">
                  <div className="loading-spinner"></div>
                </div>
              )}
              <img
                src={getImageForColor(selectedColor)}
                alt={`${product.title} - ${selectedColor}`}
                className={`product-main-image ${isImageLoading ? 'loading' : 'loaded'}`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  opacity: isImageLoading ? 0 : 1,
                  transform: isImageLoading ? 'scale(0.95)' : 'scale(1)',
                }}
              />
            </div>
            
            {/* Color Options */}
            <div className="color-selection">
              <h3 className="color-title">Available Colors</h3>
              <div className="color-options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    title={color}
                  >
                    <div 
                      className="color-swatch"
                      style={{ backgroundColor: getColorCode(color) }}
                    ></div>
                    <span className="color-name">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Information */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title">{product.title}</h1>
              <div className="product-code">{product.code}</div>
            </div>
            
            <p className="product-description">{product.description}</p>

            {/* Technical Specifications */}
            <div className="technical-specs">
              <h3 className="section-title">Technical Specifications</h3>
              <div className="specs-grid">
                {Object.entries(product.technicalInfo).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {product.features && (
              <div className="features-section">
                <h3 className="section-title">Features</h3>
                <div className="features-grid">
                  {product.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications */}
            {product.applications && (
              <div className="applications-section">
                <h3 className="section-title">Application Areas</h3>
                <div className="applications-grid">
                  {product.applications.map((application, index) => (
                    <div key={index} className="application-item">
                      <span className="application-icon">🏠</span>
                      <span className="application-text">{application}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Buttons */}
            <div className="contact-section">
              <h3 className="section-title">Pricing and Detailed Information</h3>
              <p className="contact-text">For detailed information and pricing about this product, please contact us:</p>
              <div className="contact-buttons">
                <a href="tel:+905555555555" className="contact-btn primary">
                  <span className="btn-icon">📞</span>
                  Call Now
                </a>
                <a href="https://wa.me/905555555555" target="_blank" rel="noopener noreferrer" className="contact-btn secondary">
                  <span className="btn-icon">💬</span>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="disclaimer">
              <p>* Dimensions and weights are approximate values. Box coverage is based on jointed application. For stacked application, order quantity should be increased by 15%-25%.</p>
            </div>

            {/* Back to Products */}
            <div className="back-link" style={{ marginTop: '30px', textAlign: 'center' }}>
              <Link href="/en" className="contact-btn secondary" style={{ display: 'inline-flex' }}>
                <span className="btn-icon">←</span>
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 