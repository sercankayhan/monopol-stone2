"use client";
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link'

export default function Header() {
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement | null>(null);

  // Body scroll lock + focus trap + ESC to close
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('no-scroll');

      // Focus first link
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a, button');
      focusable && focusable[0]?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
          return;
        }
        if (e.key === 'Tab' && focusable && focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.classList.remove('no-scroll');
      };
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isMobileMenuOpen]);

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
                  color: '#333'
                }}
                aria-expanded={isMobileMenuOpen}
                aria-controls="primary-navigation"
                aria-label={isMobileMenuOpen ? (isEn ? 'Close menu' : 'Menüyü kapat') : (isEn ? 'Open menu' : 'Menüyü aç')}
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
            
            {/* Sol: Logo */}
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', marginLeft: '-20px', flex: '0 0 auto' }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
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
              </Link>
            </div>
            
            {/* Orta: Menü */}
            <nav style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1001 }}>
              <ul ref={menuRef} id="primary-navigation" className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <li>
                  <Link href={isEn ? "/en" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#444', borderRadius: '8px', padding: '6px 16px', fontWeight: 700, color: '#fff', WebkitTextFillColor: '#fff', transition: 'background-color 0.3s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#FD7E14'; const img = e.currentTarget.querySelector('img'); if (img) (img as HTMLImageElement).style.filter = 'brightness(0) invert(1)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#444'; const img = e.currentTarget.querySelector('img'); if (img) (img as HTMLImageElement).style.filter = 'none'; }}>
                    <img src="/house.svg" alt="Home Icon" style={{ width: 22, height: 22, verticalAlign: 'middle', transition: 'filter 0.3s ease' }} />
                    {isEn ? "HOME" : "ANASAYFA"}
                  </Link>
                </li>
                <li style={{ position: 'relative' }}>
                  <Link
                    href={isEn ? "/en/urunler" : "/urunler"}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isEn ? "PRODUCTS" : "ÜRÜNLER"}
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s ease' }}>▼</span>
                  </Link>
                  <div className="dropdown-menu">
                    <Link href={isEn ? "/en/products" : "/urunler/kultur-taslari"} style={{
                      display: 'block',
                      padding: '10px 20px',
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #f0f0f0',
                    }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.background = '#f8f8f8'} onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}>
                      <span style={{ color: '#FFA726 !important', marginRight: '8px', WebkitTextFillColor: '#FFA726' }}>•</span>
                      {isEn ? 'Culture Stones' : 'Kültür Taşları'}
                    </Link>
                    <Link href={isEn ? "/en/products" : "/urunler/kultur-tuglalari"} style={{
                      display: 'block',
                      padding: '10px 20px',
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                    }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.background = '#f8f8f8'} onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}>
                      <span style={{ color: '#FB8C00 !important', marginRight: '8px', WebkitTextFillColor: '#FB8C00' }}>•</span>
                      {isEn ? 'Culture Bricks' : 'Kültür Tuğlaları'}
                    </Link>
                  </div>
                </li>
                <li><Link href={isEn ? "/en/gallery" : "/galeri"}>{isEn ? "GALLERY" : "GÖRSEL GALERİ"}</Link></li>
                <li><Link href={isEn ? "/en/contact" : "/iletisim"}>{isEn ? "CONTACT US" : "BİZE ULAŞIN"}</Link></li>
              </ul>
            </nav>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
              <div
                className="mobile-overlay"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1000 }}
              />
            )}
            
            {/* Sağ: Dil seçici */}
            <div className="language-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '0 0 auto', marginRight: '8px' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/tr.svg" alt="Türkçe" style={{ width: 28, height: 28 }} />
              </Link>
              <Link href="/en" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/gb.svg" alt="English" style={{ width: 28, height: 28 }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 