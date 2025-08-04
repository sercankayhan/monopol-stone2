'use client'

import FloatingButtons from '@/components/FloatingButtons'
import Breadcrumb from '@/components/Breadcrumb'

export default function GalleryEn() {
  const galleryCategories = [
    {
      title: 'Completed Projects',
      description: 'View our successfully completed projects and applications.',
      image: '/images/gallery-projects.jpg',
      link: '/en/gallery/projects'
    },
    {
      title: 'Application Examples',
      description: 'See various application examples and installation techniques.',
      image: '/images/gallery-applications.jpg',
      link: '/en/gallery/applications'
    },
    {
      title: 'Showroom',
      description: 'Explore our showroom and product displays.',
      image: '/images/gallery-showroom.jpg',
      link: '/en/gallery/showroom'
    }
  ]

  return (
    <main>
      <Breadcrumb />
      <FloatingButtons />
      
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#fff' }}>
            Visual Gallery
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '600px', margin: '0 auto' }}>
            Discover our completed projects, application examples, and showroom displays. 
            Each image showcases the quality and versatility of Monopol Stone products.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '40px',
          marginTop: '40px'
        }}>
          {galleryCategories.map((category, index) => (
            <div key={index} style={{
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                height: '250px',
                background: `linear-gradient(45deg, #f0f0f0, #e0e0e0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#999'
              }}>
                📸
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '12px', 
                  color: '#333',
                  fontWeight: 600
                }}>
                  {category.title}
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.6,
                  marginBottom: '20px'
                }}>
                  {category.description}
                </p>
                <button style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }} onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'} onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}>
                  View Gallery
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '80px',
          padding: '40px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#fff' }}>
            Need More Information?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#ccc', marginBottom: '30px' }}>
            Contact us for detailed information about our products and services.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+905323820197" style={{
              background: '#e74c3c',
              color: '#fff',
              textDecoration: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              transition: 'background-color 0.3s ease'
            }} onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'} onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}>
              📞 Call Now
            </a>
            <a href="https://wa.me/905323820197" target="_blank" rel="noopener noreferrer" style={{
              background: '#25d366',
              color: '#fff',
              textDecoration: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              transition: 'background-color 0.3s ease'
            }} onMouseEnter={(e) => e.currentTarget.style.background = '#128c7e'} onMouseLeave={(e) => e.currentTarget.style.background = '#25d366'}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  )
} 