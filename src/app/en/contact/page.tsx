'use client'

import { useState, useEffect } from 'react'
import FloatingButtons from '@/components/FloatingButtons'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Basit bir iframe haritası kullan
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    // Simüle edilmiş form gönderimi
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 3000)
    }, 1500)
  }

  return (
    <main>
      <FloatingButtons />
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        padding: '80px 0 60px 0',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'white'
          }}>
            Contact Us
          </h1>
          <p style={{
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto',
            opacity: '0.9'
          }}>
            Get in touch with us for your projects. We are happy to offer you the most suitable solutions.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ padding: '80px 0', background: '#f8f9fa' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'start'
          }}>
            
            {/* Contact Form */}
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                marginBottom: '30px',
                color: '#2c3e50'
              }}>
                Get In Touch
              </h2>

              {submitStatus === 'success' && (
                <div style={{
                  background: '#d4edda',
                  color: '#155724',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #c3e6cb'
                }}>
                  Your message has been sent successfully! We will get back to you as soon as possible.
                </div>
              )}

              {submitStatus === 'error' && (
                <div style={{
                  background: '#f8d7da',
                  color: '#721c24',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #f5c6cb'
                }}>
                  An error occurred. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FD7E14'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FD7E14'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FD7E14'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FD7E14'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  >
                    <option value="">Select a subject</option>
                    <option value="cultured-stone">Cultured Stone</option>
                    <option value="cultured-brick">Cultured Brick</option>
                    <option value="price-quote">Price Quote</option>
                    <option value="technical-info">Technical Information</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FD7E14'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    placeholder="Write details about your project here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: isSubmitting ? '#6c757d' : '#FD7E14',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) (e.target as HTMLButtonElement).style.background = '#e65a00'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) (e.target as HTMLButtonElement).style.background = '#FD7E14'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                marginBottom: '30px',
                color: '#2c3e50'
              }}>
                Contact Information
              </h2>

              <div style={{ marginBottom: '40px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '25px',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: '#FD7E14',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '20px',
                    flexShrink: 0
                  }}>
                    <img src="/location.svg" alt="Location" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      marginBottom: '5px',
                      color: '#2c3e50'
                    }}>
                      Address
                    </h3>
                    <p style={{
                      color: '#6c757d',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      Çatalca / Istanbul<br />
                      Turkey
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '25px',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: '#FD7E14',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '20px',
                    flexShrink: 0
                  }}>
                    <img src="/call.svg" alt="Phone" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      marginBottom: '5px',
                      color: '#2c3e50'
                    }}>
                      Phone
                    </h3>
                    <p style={{
                      color: '#6c757d',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      <a href="tel:+905323820197" style={{
                        color: '#FD7E14',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}>
                        +90 (532) 382 01 97
                      </a>
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '25px',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: '#FD7E14',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '20px',
                    flexShrink: 0
                  }}>
                    <img src="/email.svg" alt="Email" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      marginBottom: '5px',
                      color: '#2c3e50'
                    }}>
                      Email
                    </h3>
                    <p style={{
                      color: '#6c757d',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      <a href="mailto:info@monopolstone.com" style={{
                        color: '#FD7E14',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}>
                        info@monopolstone.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div style={{
                background: 'white',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  margin: '0',
                  padding: '20px',
                  borderBottom: '1px solid #e9ecef',
                  color: '#2c3e50'
                }}>
                  Location
                </h3>
                <div style={{ height: '300px', width: '100%' }}>
                  {mapLoaded ? (
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.1234567890123!2d28.4614!3d41.1435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDA4JzM2LjYiTiAyOMKwMjcnNDEuMCJF!5e0!3m2!1str!2str!4v1234567890123"
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: '0 0 10px 10px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div style={{
                      height: '100%',
                      background: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6c757d'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '3rem',
                          marginBottom: '10px',
                          opacity: '0.5'
                        }}>
                          📍
                        </div>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                          Çatalca / Istanbul
                        </p>
                        <p style={{ margin: '5px 0 0 0', opacity: '0.7' }}>
                          Loading map...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 