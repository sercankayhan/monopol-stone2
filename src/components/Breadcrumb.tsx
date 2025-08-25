"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const breadcrumbMapTr: Record<string, string> = {
  '': 'Anasayfa',
  'urun': 'Ürünler',
  'urunler': 'Ürünler',
  'kultur-taslari': 'Kültür Taşları',
  'kultur-tuglalari': 'Kültür Tuğlaları',
  'galeri': 'Görsel Galeri',
  'farkliliklar': 'Farklılıklarımız',
  'profesyonellere-ozel': 'Profesyonellere Özel',
  'iletisim': 'İletişim',
  'kultur-tasi-1': 'Mitra',
  'kultur-tasi-2': 'Luminar',
  'kultur-tasi-3': 'Belezza',
  'kultur-tasi-4': 'Arvion',
  'kultur-tasi-5': 'Tivoli',
  'kultur-tuglasi-1': 'Leon',
  'kultur-tuglasi-2': 'Leila',
  'kultur-tuglasi-3': 'Lora',
};
const breadcrumbMapEn: Record<string, string> = {
  '': 'Home',
  'products': 'Products',
  'gallery': 'Gallery',
  'differences': 'Our Differences',
  'for-professionals': 'For Professionals',
  'contact': 'Contact',
  // örnek ürünler
  'culture-stone-1': 'Mitra',
  'culture-stone-2': 'Luminar',
  'culture-stone-3': 'Belezza',
  'culture-stone-4': 'Arvion',
  'culture-stone-5': 'Tivoli',
  'culture-brick-1': 'Leon',
  'culture-brick-2': 'Leila',
  'culture-brick-3': 'Lora',
};

const colors = ['#FFA726', '#FB8C00', '#E53935'];

function formatTitle(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const [isEn, setIsEn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    setIsEn(pathname.startsWith('/en'));
  }, [pathname]);

  // Parçaları al, eğer İngilizce ise baştaki 'en'i atla
  const parts = pathname.split('/').filter(Boolean);
  const realParts = isClient && isEn ? parts.slice(1) : parts;
  let path = isClient && isEn ? '/en' : '';
  const map = isClient && isEn ? breadcrumbMapEn : breadcrumbMapTr;

  // Ana sayfada breadcrumb gösterme
  if (pathname === '/' || pathname === '/en') {
    return null;
  }

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.92)',
      borderBottom: '1px solid #eee',
      fontSize: '0.98rem',
      padding: '10px 0 10px 32px',
      color: '#444',
      letterSpacing: '0.01em',
      zIndex: 900,
      position: 'relative',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 0,
    }} aria-label="breadcrumb">
      {realParts.length === 0 ? (
        <span style={{ color: colors[0], fontWeight: 700 }}>{map['']}</span>
      ) : (
        <>
          <Link href={isEn ? "/en" : "/"} style={{ color: colors[0], textDecoration: 'none', fontWeight: 700 }}>{map['']}</Link>
          <span style={{ margin: '0 8px', color: '#aaa' }}>/</span>
          {realParts.map((part, idx) => {
            path += '/' + part;
            const isLast = idx === realParts.length - 1;
            const label = map[part] || formatTitle(part.replace(/-/g, ' '));
            const color = colors[idx + 1] || colors[2];
            
            // Özel durum: "urun" ve "products" linklerini doğru sayfalara yönlendir
            let linkPath = path;
            if (part === 'urun') {
              linkPath = isEn ? '/en/products' : '/urunler';
            } else if (part === 'products') {
              linkPath = '/en/products';
            }
            
            return isLast ? (
              <span key={part} style={{ color, fontWeight: 700 }}>{label}</span>
            ) : (
              <span key={part}>
                <Link href={linkPath} style={{ color, textDecoration: 'none', fontWeight: 700 }}>{label}</Link>
                <span style={{ margin: '0 8px', color: '#aaa' }}>/</span>
              </span>
            );
          })}
        </>
      )}
    </nav>
  );
} 