"use client";
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header" style={{
      position: 'relative',
      zIndex: 1000,
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      fontWeight: 400,
    }}>
      {/* Spot ışığı efekti */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100px',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 20% 0, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.05) 40%, transparent 80%),\nradial-gradient(circle at 50% 0, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.05) 40%, transparent 80%),\nradial-gradient(circle at 80% 0, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.05) 40%, transparent 80%)'
      }} />
      
      <div className="header-top" style={{ background: '#d8d8d8', borderBottom: '1px solid #c0c0c0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', fontSize: '14px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src="/location.svg" alt="Location" style={{ width: 16, height: 16 }} />
                Çatalca / İstanbul
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src="/email.svg" alt="Email" style={{ width: 16, height: 16 }} />
                info@monopolstone.com
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src="/call.svg" alt="Phone" style={{ width: 16, height: 16 }} />
                0 (532) 382 01 97
              </span>
            </div>
            <div></div>
          </div>
        </div>
      </div>
      
      <div className="header-main">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Sol: Mobile Menu Button (sadece mobilde görünür) */}
            <div className="mobile-menu-container">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#333',
                  display: 'none'
                }}
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
            
            {/* Sol: Logo */}
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', marginLeft: '-20px', flex: '0 0 auto' }}>
              <a href="/" style={{ textDecoration: 'none' }}>
                <img 
                  src="/logo.jpeg" 
                  alt="Monopol Stone Logo" 
                  style={{ 
                    height: '200px', 
                    width: 'auto',
                    maxWidth: '600px',
                    display: 'block',
                  }}
                />
              </a>
            </div>
            
            {/* Orta: Menü */}
            <nav style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1001 }}>
              <ul className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <li>
                  <a href={isEn ? "/en" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#444', borderRadius: '8px', padding: '6px 16px', fontWeight: 700, color: '#fff', WebkitTextFillColor: '#fff', transition: 'background-color 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#FD7E14'; const img = e.currentTarget.querySelector('img'); if (img) img.style.filter = 'brightness(0) invert(1)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#444'; const img = e.currentTarget.querySelector('img'); if (img) img.style.filter = 'none'; }}>
                    <img src="/house.svg" alt="Home Icon" style={{ width: 22, height: 22, verticalAlign: 'middle', transition: 'filter 0.3s ease' }} />
                    {isEn ? "HOME" : "ANASAYFA"}
                  </a>
                </li>
                <li style={{ position: 'relative' }}>
                  <a
                    href={isEn ? "/en/urunler" : "/urunler"}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isEn ? "PRODUCTS" : "ÜRÜNLER"}
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s ease' }}>▼</span>
                  </a>
                  <div className="dropdown-menu">
                    <a href={isEn ? "/en/products" : "/urunler/kultur-taslari"} style={{
                      display: 'block',
                      padding: '10px 20px',
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #f0f0f0',
                    }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ color: '#FFA726 !important', marginRight: '8px', WebkitTextFillColor: '#FFA726' }}>•</span>
                      {isEn ? 'Culture Stones' : 'Kültür Taşları'}
                    </a>
                    <a href={isEn ? "/en/products" : "/urunler/kultur-tuglalari"} style={{
                      display: 'block',
                      padding: '10px 20px',
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                    }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ color: '#FB8C00 !important', marginRight: '8px', WebkitTextFillColor: '#FB8C00' }}>•</span>
                      {isEn ? 'Culture Bricks' : 'Kültür Tuğlaları'}
                    </a>
                  </div>
                </li>
                <li><a href={isEn ? "/en/gallery" : "/galeri"}>{isEn ? "GALLERY" : "GÖRSEL GALERİ"}</a></li>
                <li><a href={isEn ? "/en/contact" : "/iletisim"}>{isEn ? "CONTACT US" : "BİZE ULAŞIN"}</a></li>
              </ul>
            </nav>
            
            {/* Sağ: Dil seçici */}
            <div className="language-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '0 0 auto', marginRight: '8px' }}>
              <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/tr.svg" alt="Türkçe" style={{ width: 28, height: 28 }} />
              </a>
              <a href="/en" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/gb.svg" alt="English" style={{ width: 28, height: 28 }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 