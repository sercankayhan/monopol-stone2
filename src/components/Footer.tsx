"use client";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');
  return (
    <footer style={{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '60px 0 40px',
      marginTop: '80px',
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 32px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'start',
        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
      }}>
        {/* Sol: Logo ve Şirket Açıklaması */}
        <div style={{ maxWidth: '400px', fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif' }}>
          <div style={{ marginBottom: '24px' }}>
            <img
              src="/siyahlogo.png"
              alt="Monopol Stone"
              style={{
                height: '140px',
                width: 'auto',
              }}
            />
          </div>
          <p style={{
            color: '#ccc',
            lineHeight: 1.6,
            fontSize: '0.95rem',
            marginBottom: '20px',
            fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
          }}>
            {isEn
              ? 'Monopol Stone preserves the authentic spirit of natural stone; produced with the desire to give it a new interpretation in different shapes and colors.'
              : 'Monopol Stone olarak doğal taşın özgün ruhunu koruyarak; farklı şekil ve renklerde, ona yeni bir yorum katma arzusuyla üretildi.'}
          </p>
          <div style={{
            color: '#999',
            fontSize: '0.9rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '20px',
            fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
          }}>
            © 2024 Monopol Stone. All rights reserved.
          </div>
        </div>

        {/* Sağ: Ürünler, Galeri ve İletişim */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '40px',
          fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
        }}>
          {/* Ürünler */}
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '1.1rem',
              marginBottom: '20px',
              fontWeight: 600,
            }}>
              {isEn ? 'Products' : 'Ürünler'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href={isEn ? "/en/products" : "/urunler"} style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#FFA726' }}>•</span>
                {isEn ? 'Culture Stones' : 'Kültür Taşları'}
              </a>
              <a href={isEn ? "/en/products" : "/urunler"} style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#FB8C00' }}>•</span>
                {isEn ? 'Culture Bricks' : 'Kültür Tuğlaları'}
              </a>
            </div>
          </div>

          {/* Görsel Galeri */}
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '1.1rem',
              marginBottom: '20px',
              fontWeight: 600,
            }}>
              {isEn ? 'Gallery' : 'Görsel Galeri'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href={isEn ? "/en/gallery" : "/galeri/projeler"} style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#FFA726' }}>•</span>
                {isEn ? 'Completed Projects' : 'Tamamlanan Projeler'}
              </a>
              <a href={isEn ? "/en/gallery" : "/galeri/uygulamalar"} style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#FB8C00' }}>•</span>
                {isEn ? 'Applications' : 'Uygulama Örnekleri'}
              </a>
              <a href={isEn ? "/en/gallery" : "/galeri/showroom"} style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#E53935' }}>•</span>
                {isEn ? 'Showroom' : 'Showroom'}
              </a>
            </div>
          </div>

          {/* Bize Ulaşın */}
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '1.1rem',
              marginBottom: '20px',
              fontWeight: 600,
            }}>
              {isEn ? 'Contact Us' : 'Bize Ulaşın'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                color: '#ccc',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#E53935' }}>📞</span>
                <a href="tel:+905323820197" style={{
                  color: '#ccc',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}>
                  0 (532) 382 01 97
                </a>
              </div>
              <div style={{
                color: '#ccc',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#E53935' }}>📧</span>
                <a href="mailto:info@monopolstone.com" style={{
                  color: '#ccc',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}>
                  info@monopolstone.com
                </a>
              </div>
              <div style={{
                color: '#ccc',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#E53935' }}>📍</span>
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 