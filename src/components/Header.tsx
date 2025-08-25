"use client";
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';


export default function Header() {
  const pathname = usePathname();
  const [isEn, setIsEn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { handleError } = useErrorHandling({
    enableLogging: true,
    onError: (error) => {
      console.error('Header error:', error);
    }
  });

  const { measureUserInteraction } = usePerformanceMonitoring('Header');

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    setIsEn(pathname.startsWith('/en'));
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mobile menu
  const toggleMobileMenu = () => {
    const endMeasurement = measureUserInteraction('mobile_menu_toggle');
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
    
    endMeasurement();
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle language switch
  const handleLanguageSwitch = (lang: 'tr' | 'en') => {
    const endMeasurement = measureUserInteraction(`language_switch_${lang}`);
    
    const currentPath = pathname.replace(/^\/en/, '');
    const newPath = lang === 'en' ? `/en${currentPath}` : currentPath || '/';
    
    window.location.href = newPath;
    endMeasurement();
  };



  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      fontWeight: 400,
      background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
      backdropFilter: isScrolled ? 'blur(10px)' : 'none',
      boxShadow: isScrolled ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none',
      transition: 'all 0.3s ease',
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }} suppressHydrationWarning>
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

            
            {/* Sol: Logo */}
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', marginLeft: '-20px', flex: '0 0 auto' }}>
              <Link href={isClient && isEn ? "/en" : "/"} style={{ textDecoration: 'none' }}>
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
              <ul className="nav-menu">
                <li>
                  <Link href={isClient && isEn ? "/en" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#444', borderRadius: '8px', padding: '6px 16px', fontWeight: 700, color: '#fff', WebkitTextFillColor: '#fff', transition: 'background-color 0.3s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#FD7E14'; const img = e.currentTarget.querySelector('img'); if (img) (img as HTMLImageElement).style.filter = 'brightness(0) invert(1)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#444'; const img = e.currentTarget.querySelector('img'); if (img) (img as HTMLImageElement).style.filter = 'none'; }}>
                    <img src="/house.svg" alt="Home Icon" style={{ width: 22, height: 22, verticalAlign: 'middle', transition: 'filter 0.3s ease' }} />
                    {isClient && isEn ? "HOME" : "ANASAYFA"}
                  </Link>
                </li>
                <li style={{ position: 'relative' }}>
                  <Link
                    href={isClient && isEn ? "/en/products" : "/urunler"}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isClient && isEn ? "PRODUCTS" : "ÜRÜNLER"}
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s ease' }}>▼</span>
                  </Link>
                  <div className="dropdown-menu">
                    <Link href={isClient && isEn ? "/en/products" : "/urunler/kultur-taslari"} style={{
                      display: 'block',
                      padding: '10px 20px',
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #f0f0f0',
                    }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.background = '#f8f8f8'} onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}>
                      <span style={{ color: '#FFA726 !important', marginRight: '8px', WebkitTextFillColor: '#FFA726' }}>•</span>
                      {isClient && isEn ? 'Culture Stones' : 'Kültür Taşları'}
                    </Link>
                    <Link href={isClient && isEn ? "/en/products" : "/urunler/kultur-tuglalari"} style={{
                      display: 'block',
                      padding: '10px 20px',
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                    }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.background = '#f8f8f8'} onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}>
                      <span style={{ color: '#FB8C00 !important', marginRight: '8px', WebkitTextFillColor: '#FB8C00' }}>•</span>
                      {isClient && isEn ? 'Culture Bricks' : 'Kültür Tuğlaları'}
                    </Link>
                  </div>
                </li>
                <li><Link href={isClient && isEn ? "/en/gallery" : "/galeri"}>{isClient && isEn ? "GALLERY" : "GÖRSEL GALERİ"}</Link></li>
                <li><Link href={isClient && isEn ? "/en/contact" : "/iletisim"}>{isClient && isEn ? "CONTACT US" : "BİZE ULAŞIN"}</Link></li>
              </ul>
            </nav>


            
            {/* Sağ: Navigation ve Mobil Menü */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '0 0 auto' }}>
              
              {/* Desktop Navigation */}
              <nav className="desktop-nav">
                <ul style={{
                  display: 'flex',
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  gap: '24px',
                  alignItems: 'center',
                }}>
                  <li>
                    <Link href={isClient && isEn ? "/en" : "/"} style={{
                      textDecoration: 'none',
                      color: '#333',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      transition: 'color 0.3s ease',
                    }}>
                      {isClient && isEn ? 'Home' : 'Anasayfa'}
                    </Link>
                  </li>
                  <li>
                    <Link href={isClient && isEn ? "/en/products" : "/urunler"} style={{
                      textDecoration: 'none',
                      color: '#333',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      transition: 'color 0.3s ease',
                    }}>
                      {isClient && isEn ? 'Products' : 'Ürünler'}
                    </Link>
                  </li>
                  <li>
                    <Link href={isClient && isEn ? "/en/gallery" : "/galeri"} style={{
                      textDecoration: 'none',
                      color: '#333',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      transition: 'color 0.3s ease',
                    }}>
                      {isClient && isEn ? 'Gallery' : 'Galeri'}
                    </Link>
                  </li>
                  <li>
                    <Link href={isClient && isEn ? "/en/contact" : "/iletisim"} style={{
                      textDecoration: 'none',
                      color: '#333',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      transition: 'color 0.3s ease',
                    }}>
                      {isClient && isEn ? 'Contact' : 'İletişim'}
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Dil seçici */}
              <div className="language-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => handleLanguageSwitch('tr')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    opacity: !isEn ? 1 : 0.6,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <img src="/tr.svg" alt="Türkçe" style={{ width: 24, height: 24 }} />
                </button>
                <button
                  onClick={() => handleLanguageSwitch('en')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    opacity: isEn ? 1 : 0.6,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <img src="/gb.svg" alt="English" style={{ width: 24, height: 24 }} />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="mobile-menu-btn"
                onClick={toggleMobileMenu}
                style={{
                  display: 'none',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.3s ease',
                }}
                aria-label="Menu"
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  transform: isMobileMenuOpen ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.3s ease',
                }}>
                  <span style={{
                    width: '100%',
                    height: '2px',
                    background: '#333',
                    borderRadius: '1px',
                    transformOrigin: 'center',
                    transition: 'all 0.3s ease',
                    transform: isMobileMenuOpen ? 'rotate(90deg) translateY(0px)' : 'none',
                  }} />
                  <span style={{
                    width: '100%',
                    height: '2px',
                    background: '#333',
                    borderRadius: '1px',
                    opacity: isMobileMenuOpen ? 0 : 1,
                    transition: 'opacity 0.3s ease',
                  }} />
                  <span style={{
                    width: '100%',
                    height: '2px',
                    background: '#333',
                    borderRadius: '1px',
                    transformOrigin: 'center',
                    transition: 'all 0.3s ease',
                    transform: isMobileMenuOpen ? 'rotate(-90deg) translateY(0px)' : 'none',
                  }} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          onClick={() => {
            setIsMobileMenuOpen(false);
            document.body.style.overflow = 'auto';
          }}
        />
      )}

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className="mobile-menu"
        style={{
          position: 'fixed',
          top: 0,
          right: isMobileMenuOpen ? 0 : '-100%',
          width: '280px',
          height: '100vh',
          background: '#fff',
          zIndex: 1001,
          transition: 'right 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-2px 0 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Mobile Menu Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <img src="/logo.jpeg" alt="Monopol Stone" style={{ height: '40px', width: 'auto' }} />
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              document.body.style.overflow = 'auto';
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}>
            {[
              { href: isClient && isEn ? "/en" : "/", label: isClient && isEn ? 'Home' : 'Anasayfa', icon: '🏠' },
              { href: isClient && isEn ? "/en/products" : "/urunler", label: isClient && isEn ? 'Products' : 'Ürünler', icon: '🏗️' },
              { href: isClient && isEn ? "/en/gallery" : "/galeri", label: isClient && isEn ? 'Gallery' : 'Galeri', icon: '🖼️' },
              { href: isClient && isEn ? "/en/contact" : "/iletisim", label: isClient && isEn ? 'Contact' : 'İletişim', icon: '📞' },
            ].map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    document.body.style.overflow = 'auto';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    textDecoration: 'none',
                    color: '#333',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #eee',
        }}>
          {/* Language Switch */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <button
              onClick={() => {
                handleLanguageSwitch('tr');
                setIsMobileMenuOpen(false);
                document.body.style.overflow = 'auto';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: !isEn ? '2px solid #FD7E14' : '2px solid #e0e0e0',
                borderRadius: '8px',
                background: !isEn ? '#FFF3E6' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
            >
              <img src="/tr.svg" alt="TR" style={{ width: '20px', height: '20px' }} />
              Türkçe
            </button>
            <button
              onClick={() => {
                handleLanguageSwitch('en');
                setIsMobileMenuOpen(false);
                document.body.style.overflow = 'auto';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: isEn ? '2px solid #FD7E14' : '2px solid #e0e0e0',
                borderRadius: '8px',
                background: isEn ? '#FFF3E6' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
            >
              <img src="/gb.svg" alt="EN" style={{ width: '20px', height: '20px' }} />
              English
            </button>
          </div>

          {/* Contact Info */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#666',
          }}>
            <div style={{ marginBottom: '8px' }}>
              📞 0 (532) 382 01 97
            </div>
            <div>
              📧 info@monopolstone.com
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 