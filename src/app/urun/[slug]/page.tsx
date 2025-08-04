"use client";
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

interface Product {
  slug: string;
  title: string;
  description: string;
  images?: {
    [key: string]: string;
  };
  colors?: Array<{
    key: string;
    name: string;
    code: string;
  }>;
  thickness?: string;
  weight?: string;
  code?: string;
  image?: string;
  features?: string[];
  applications?: string[];
}

const products: Product[] = [
  {
    slug: 'kultur-tasi-1',
    title: 'Mitra',
    description: "Asimetrik taşlardan olan ve adını Mısır'ın başkentinden alan bu taş modelimiz, Kahire'nin 19.yy mimarisinden esinlenerek tasarlanmıştır. Doğadan özenle seçilmiş doku ve renk seçenekleri ile her türden mekanı yaşayan bir alana çevirebilirsiniz.",
    images: {
      'gölge': '/images/webp-optimized/mitra-gölge.jpg',
      'sis': '/images/webp-optimized/mitra-sis.jpg',
      'toprak': '/images/webp-optimized/mitra-toprak.jpg',
      'antrasit': '/images/webp-optimized/mitra-antrasit.jpg',
    },
    colors: [
      { key: 'gölge', name: 'Gölge', code: '#bfc3c6' },
      { key: 'sis', name: 'Sis', code: '#e3e6e8' },
      { key: 'toprak', name: 'Toprak', code: '#b49a7a' },
      { key: 'antrasit', name: 'Antrasit', code: '#222' },
    ],
    thickness: '3-5 cm',
    weight: '45 kg/m²',
    code: 'BP-13001',
    features: [
      'Doğal taş görünümü',
      'Kolay uygulama',
      'Uzun ömürlü',
      'Su geçirmez',
      'Isı yalıtımı',
      'Ses yalıtımı'
    ],
    applications: [
      'Dış cephe kaplaması',
      'İç duvar dekorasyonu',
      'Şömine çevresi',
      'Bahçe duvarları',
      'Teras kaplaması',
      'Villa projeleri'
    ]
  },
  {
    slug: 'kultur-tasi-2',
    title: 'Luminar',
    description: 'Modern tasarım kültür taşı modelleri. İç ve dış mekan uygulamaları için ideal. Çağdaş mimari projelerde tercih edilen şık görünüm.',
    images: {
      'gölge': '/images/webp-optimized/luminar-gölge.jpg',
      'sis': '/images/webp-optimized/luminar-sis.jpg',
      'toprak': '/images/webp-optimized/luminar-toprak.jpg',
      'antrasit': '/images/webp-optimized/luminar-antrasit.jpg',
    },
    colors: [
      { key: 'gölge', name: 'Gölge', code: '#bfc3c6' },
      { key: 'sis', name: 'Sis', code: '#e3e6e8' },
      { key: 'toprak', name: 'Toprak', code: '#b49a7a' },
      { key: 'antrasit', name: 'Antrasit', code: '#222' },
    ],
    thickness: '3-5 cm',
    weight: '45 kg/m²',
    code: 'BP-13002',
    features: [
      'Modern tasarım',
      'Kolay uygulama',
      'Uzun ömürlü',
      'Su geçirmez',
      'Isı yalıtımı',
      'Ses yalıtımı'
    ],
    applications: [
      'Modern bina cepheleri',
      'İç mekan dekorasyonu',
      'Ofis projeleri',
      'AVM cepheleri',
      'Otel projeleri',
      'Rezidans projeleri'
    ]
  },
  {
    slug: 'kultur-tasi-3',
    title: 'Belezza',
    description: 'Klasik görünümlü kültür taşı modelleri. Villa ve konut projeleri için özel tasarım. Zamansız güzellik ve kalite.',
    images: {
      'gölge': '/images/webp-optimized/belezza-günbatımı.jpg',
      'sis': '/images/webp-optimized/belezza-yıldız.jpg',
      'toprak': '/images/webp-optimized/belezza-günbatımı.jpg',
      'antrasit': '/images/webp-optimized/belezza-yıldız.jpg',
    },
    colors: [
      { key: 'gölge', name: 'Günbatımı', code: '#d4a574' },
      { key: 'sis', name: 'Yıldız', code: '#f5f5dc' },
      { key: 'toprak', name: 'Günbatımı', code: '#d4a574' },
      { key: 'antrasit', name: 'Yıldız', code: '#f5f5dc' },
    ],
    thickness: '3-5 cm',
    weight: '45 kg/m²',
    code: 'BP-13003',
    features: [
      'Klasik tasarım',
      'Kolay uygulama',
      'Uzun ömürlü',
      'Su geçirmez',
      'Isı yalıtımı',
      'Ses yalıtımı'
    ],
    applications: [
      'Villa cepheleri',
      'Konut projeleri',
      'Bahçe duvarları',
      'Şömine çevresi',
      'Teras kaplaması',
      'Lüks projeler'
    ]
  },
  {
    slug: 'kultur-tasi-4',
    title: 'Arvion',
    description: 'Rustik görünümlü kültür taşı modelleri. Köy evi ve doğal yaşam projeleri için özel. Doğanın sıcaklığını mekanlarınıza taşır.',
    images: {
      'gölge': '/images/webp-optimized/arvion-gölge.jpg',
      'sis': '/images/webp-optimized/arvion-sis.jpg',
      'toprak': '/images/webp-optimized/arvion-toprak.jpg',
      'antrasit': '/images/webp-optimized/arvion-antrasit.jpg',
    },
    colors: [
      { key: 'gölge', name: 'Gölge', code: '#bfc3c6' },
      { key: 'sis', name: 'Sis', code: '#e3e6e8' },
      { key: 'toprak', name: 'Toprak', code: '#b49a7a' },
      { key: 'antrasit', name: 'Antrasit', code: '#222' },
    ],
    thickness: '3-5 cm',
    weight: '45 kg/m²',
    code: 'BP-13004',
    features: [
      'Rustik tasarım',
      'Doğal görünüm',
      'Kolay uygulama',
      'Uzun ömürlü',
      'Su geçirmez',
      'Isı yalıtımı'
    ],
    applications: [
      'Köy evleri',
      'Doğal yaşam projeleri',
      'Bahçe duvarları',
      'Şömine çevresi',
      'Teras kaplaması',
      'Rustik projeler'
    ]
  },
  {
    slug: 'kultur-tasi-5',
    title: 'Tivoli',
    description: 'Lüks ve premium kültür taşı modelleri. Özel projeler ve villa uygulamaları için. Prestijli projelerin tercihi.',
    images: {
      'gölge': '/images/webp-optimized/tivoli-gölge.jpg',
      'sis': '/images/webp-optimized/tivoli-sis.jpg',
      'toprak': '/images/webp-optimized/tivoli-toprak.jpg',
      'antrasit': '/images/webp-optimized/tivoli-antrasit.jpg',
    },
    colors: [
      { key: 'gölge', name: 'Gölge', code: '#bfc3c6' },
      { key: 'sis', name: 'Sis', code: '#e3e6e8' },
      { key: 'toprak', name: 'Toprak', code: '#b49a7a' },
      { key: 'antrasit', name: 'Antrasit', code: '#222' },
    ],
    thickness: '3-5 cm',
    weight: '45 kg/m²',
    code: 'BP-13005',
    features: [
      'Premium tasarım',
      'Lüks görünüm',
      'Kolay uygulama',
      'Uzun ömürlü',
      'Su geçirmez',
      'Isı yalıtımı'
    ],
    applications: [
      'Lüks villa projeleri',
      'Premium konutlar',
      'Otel projeleri',
      'Rezidans projeleri',
      'Özel projeler',
      'Prestijli yapılar'
    ]
  },
  // Kültür Tuğlaları
  {
    slug: 'kultur-tuglasi-1',
    title: 'Leon',
    description: 'Leon serisi kültür tuğlası modelleri. Modern ve klasik projeler için ideal. Yüksek kaliteli malzeme ve özenli işçilik ile üretilmiştir.',
    images: {
              'inci': '/images/webp-optimized/leon-inci.jpg',
      'çakıl': '/images/webp-optimized/leon-çakıl.jpg',
      'çöl': '/images/webp-optimized/leon-çöl 1.jpg',
      'köz': '/images/webp-optimized/leon-köz.jpg',
      'lav': '/images/webp-optimized/leon-lav.jpg',
      'mix': '/images/webp-optimized/leon-mix.jpg',
    },
    colors: [
      { key: 'inci', name: 'İnci', code: '#f5f5f5' },
      { key: 'çakıl', name: 'Çakıl', code: '#8b7355' },
      { key: 'çöl', name: 'Çöl', code: '#d2b48c' },
      { key: 'köz', name: 'Köz', code: '#8b4513' },
      { key: 'lav', name: 'Lav', code: '#2f2f2f' },
      { key: 'mix', name: 'Mix', code: '#696969' },
    ],
    thickness: '2-12"',
    weight: '35 kg/m²',
    code: 'BT-14001',
    features: [
      'Modern tasarım',
      'Kolay uygulama',
      'Uzun ömürlü',
      'Su geçirmez',
      'Isı yalıtımı',
      'Ses yalıtımı'
    ],
    applications: [
      'Dış cephe kaplaması',
      'İç duvar dekorasyonu',
      'Şömine çevresi',
      'Bahçe duvarları',
      'Teras kaplaması',
      'Villa projeleri'
    ]
  },
  {
    slug: 'kultur-tuglasi-2',
    title: 'Leila',
    description: 'Leila serisi kültür tuğlası modelleri. Farklı renk ve dokularıyla dikkat çeker. Estetik ve fonksiyonel çözümler sunar.',
    images: {
              'inci': '/images/webp-optimized/leila-inci.jpg',
      'çakıl': '/images/webp-optimized/leila-çakıl.jpg',
      'çöl': '/images/webp-optimized/leila-çol 1.jpg',
      'köz': '/images/webp-optimized/leila-köz.jpg',
      'lav': '/images/webp-optimized/leila-lav.jpg',
      'mix': '/images/webp-optimized/leila-mix.jpg',
    },
    colors: [
      { key: 'inci', name: 'İnci', code: '#f5f5f5' },
      { key: 'çakıl', name: 'Çakıl', code: '#8b7355' },
      { key: 'çöl', name: 'Çöl', code: '#d2b48c' },
      { key: 'köz', name: 'Köz', code: '#8b4513' },
      { key: 'lav', name: 'Lav', code: '#2f2f2f' },
      { key: 'mix', name: 'Mix', code: '#696969' },
    ],
    thickness: '2-12"',
    weight: '35 kg/m²',
    code: 'BT-14002',
    features: [
      'Çeşitli renk seçenekleri',
      'Kolay uygulama',
      'Uzun ömürlü',
      'Su geçirmez',
      'Isı yalıtımı',
      'Ses yalıtımı'
    ],
    applications: [
      'Dış cephe kaplaması',
      'İç duvar dekorasyonu',
      'Şömine çevresi',
      'Bahçe duvarları',
      'Teras kaplaması',
      'Konut projeleri'
    ]
  },
  {
    slug: 'kultur-tuglasi-3',
    title: 'Lora',
    description: 'Lora serisi kültür tuğlası modelleri. Estetik ve dayanıklı çözümler sunar. Her türlü projeye uygun tasarım.',
    images: {
              'inci': '/images/webp-optimized/lora-inci.jpg',
      'çakıl': '/images/webp-optimized/lora-çakıl.jpg',
      'çöl': '/images/webp-optimized/lora-çöl 1.jpg',
      'köz': '/images/webp-optimized/lora-köz.jpg',
      'lav': '/images/webp-optimized/lora-lav.jpg',
      'mix': '/images/webp-optimized/lora-mix.jpg',
    },
    colors: [
      { key: 'inci', name: 'İnci', code: '#f5f5f5' },
      { key: 'çakıl', name: 'Çakıl', code: '#8b7355' },
      { key: 'çöl', name: 'Çöl', code: '#d2b48c' },
      { key: 'köz', name: 'Köz', code: '#8b4513' },
      { key: 'lav', name: 'Lav', code: '#2f2f2f' },
      { key: 'mix', name: 'Mix', code: '#696969' },
    ],
    thickness: '2-12"',
    weight: '35 kg/m²',
    code: 'BT-14003',
    features: [
      'Estetik tasarım',
      'Dayanıklı yapı',
      'Kolay uygulama',
      'Uzun ömürlü',
      'Su geçirmez',
      'Isı yalıtımı'
    ],
    applications: [
      'Dış cephe kaplaması',
      'İç duvar dekorasyonu',
      'Şömine çevresi',
      'Bahçe duvarları',
      'Teras kaplaması',
      'Ticari projeler'
    ]
  },
];

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return notFound();

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.key || 'default');

  return (
    <div className="product-detail-exact">
      <Breadcrumb />
      <div className="container">

        {/* Product Title */}
        <div className="product-title-exact">
          <h1>{product.title.toUpperCase()} KÜLTÜR TAŞI</h1>
        </div>

        {/* Main Product Section */}
        <div className="product-main-exact">
          <div className="product-image-exact">
            <img
              src={product.images?.[selectedColor] || product.image || Object.values(product.images || {})[0]}
              alt={`${product.title} - ${product.colors?.find(c => c.key === selectedColor)?.name || 'Ürün'}`}
            />
          </div>

          <div className="product-details-exact">
            <div className="product-category-exact">
              <span>Kültür Taşı</span>
              <span>{product.title}</span>
            </div>

            {/* Specifications Table */}
            <div className="specs-table-exact">
              <div className="spec-row-exact">
                <span className="spec-label-exact">Boyutlar</span>
                <span className="spec-value-exact">25 - 1200 cm²</span>
              </div>
              <div className="spec-row-exact">
                <span className="spec-label-exact">Kalınlık</span>
                <span className="spec-value-exact">{product.thickness}</span>
              </div>
              <div className="spec-row-exact">
                <span className="spec-label-exact">Uygulama</span>
                <span className="spec-value-exact">Yığma & Derzli</span>
              </div>
              <div className="spec-row-exact">
                <span className="spec-label-exact">Önerilen Derz Aralığı</span>
                <span className="spec-value-exact">2,00 cm</span>
              </div>
              <div className="spec-row-exact">
                <span className="spec-label-exact">Önerilen Derz Miktarı</span>
                <span className="spec-value-exact">(+-) 6,5 kg/ m²</span>
              </div>
              <div className="spec-row-exact">
                <span className="spec-label-exact">Önerilen Yapıştırıcı Miktarı</span>
                <span className="spec-value-exact">(+-) 8 kg/ m²</span>
              </div>
              <div className="spec-row-exact">
                <span className="spec-label-exact">Ağırlık Düz / Köşe</span>
                <span className="spec-value-exact">34 kg/m² - 12 kg/m</span>
              </div>
              <div className="spec-row-exact">
                <span className="spec-label-exact">1 Kutu Kaplama Taşı</span>
                <span className="spec-value-exact">1,25m²</span>
              </div>
              <div className="spec-row-exact">
                <span className="spec-label-exact">1 Kutu Köşe Taşı</span>
                <span className="spec-value-exact">3,00 m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="product-description-exact">
          <p>{product.description}</p>
        </div>

        {/* Color Options */}
        {product.colors && (
          <div className="color-options-exact">
            {product.colors.map((color) => (
              <div key={color.key} className="color-option-exact">
                <h4>{color.name}</h4>
                <div className="product-code-exact">
                  {product.code?.replace('BP-', 'AG ').replace('BT-', 'AG ') || 'AG 2863'}
                </div>
                <button
                  onClick={() => setSelectedColor(color.key)}
                  className={`color-image-exact ${selectedColor === color.key ? 'active' : ''}`}
                >
                  <img 
                    src={product.images?.[color.key] || product.image || Object.values(product.images || {})[0]}
                    alt={color.name}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="contact-exact">
          <h3>Nasıl yardımcı olabiliriz?</h3>
          <p>Kültür taşı ve Kültür Tuğlası alanında 20 seneyi aşkın tecrübemizle ürün seçiminden uygulama bitimine dek tüm süreç boyunca yanınızdayız.</p>
          <a href="tel:+905555555555" className="contact-btn-exact">
            Bize Ulaşın
          </a>
        </div>
      </div>
    </div>
  );
} 