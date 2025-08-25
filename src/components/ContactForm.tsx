"use client";

import { useState } from 'react';
import { useFormErrorHandling, useErrorHandling } from '@/hooks/useErrorHandling';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import Loading from './Loading';
import MobileFormInput from './MobileFormInput';
import MobileTextarea from './MobileTextarea';
import MobilePhoneInput from './MobilePhoneInput';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format?: string;
}

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = "" }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    dialCode: '+90',
    format: '(999) 999 99 99'
  });

  // Auto-suggestions for common subjects
  const subjectSuggestions = [
    'Ürün Bilgisi',
    'Fiyat Teklifi',
    'Proje Danışmanlığı',
    'Bayi Başvurusu',
    'Teknik Destek',
    'Garanti',
    'Şikayet',
    'Diğer',
  ];

  const {
    fieldErrors,
    submitError,
    setFieldError,
    clearFieldError,
    setSubmitError,
    clearAllErrors,
    validateField,
    hasErrors,
  } = useFormErrorHandling();

  const { executeWithErrorHandling } = useErrorHandling({
    enableLogging: true,
    onError: (error) => {
      console.error('ContactForm error:', error);
      setIsSubmitting(false);
    }
  });

  const { measureApiCall, measureUserInteraction } = usePerformanceMonitoring('ContactForm');

  // Validation functions
  const validators = {
    name: (value: string) => {
      if (!value.trim()) return 'İsim gereklidir';
      if (value.trim().length < 2) return 'İsim en az 2 karakter olmalıdır';
      return null;
    },
    email: (value: string) => {
      if (!value.trim()) return 'E-posta gereklidir';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Geçerli bir e-posta adresi girin';
      return null;
    },
    phone: (value: string) => {
      if (!value.trim()) return 'Telefon numarası gereklidir';
      const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
      if (!phoneRegex.test(value)) return 'Geçerli bir telefon numarası girin';
      return null;
    },
    subject: (value: string) => {
      if (!value.trim()) return 'Konu gereklidir';
      if (value.trim().length < 5) return 'Konu en az 5 karakter olmalıdır';
      return null;
    },
    message: (value: string) => {
      if (!value.trim()) return 'Mesaj gereklidir';
      if (value.trim().length < 10) return 'Mesaj en az 10 karakter olmalıdır';
      return null;
    },
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
    
    // Real-time validation
    if (value.trim()) {
      validateField(field, value, validators[field]);
    }
  };

  const handlePhoneChange = (value: string, country: Country) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setSelectedCountry(country);
    clearFieldError('phone');
    
    // Real-time validation
    if (value.trim()) {
      validateField('phone', value, validators.phone);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    const endMeasurement = measureUserInteraction(`form_field_blur_${field}`);
    validateField(field, formData[field], validators[field]);
    endMeasurement();
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    Object.entries(formData).forEach(([field, value]) => {
      const fieldValid = validateField(field as keyof FormData, value, validators[field as keyof FormData]);
      if (!fieldValid) isValid = false;
    });

    return isValid;
  };

  const submitForm = async (data: FormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, randomly succeed/fail
    if (Math.random() > 0.8) {
      throw new Error('Sunucu hatası: Mesaj gönderilemedi');
    }

    return { success: true, message: 'Mesajınız başarıyla gönderildi!' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endMeasurement = measureUserInteraction('form_submit');
    clearAllErrors();

    if (!validateForm()) {
      setSubmitError('Lütfen tüm alanları doğru şekilde doldurun');
      endMeasurement();
      return;
    }

    setIsSubmitting(true);

    const result = await measureApiCall(
      () => submitForm(formData),
      'contact_form_submit'
    );

    if (result) {
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } else {
      setSubmitError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }

    setIsSubmitting(false);
    endMeasurement();
  };

  if (isSuccess) {
    return (
      <div className={`contact-form-success ${className}`} style={{
        background: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#155724',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 600 }}>
          Mesajınız Gönderildi!
        </h3>
        <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
          Mesajınız başarıyla gönderildi. En kısa sürede size geri dönüş yapacağız.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          style={{
            marginTop: '20px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.3s ease',
          }}
        >
          Yeni Mesaj Gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`contact-form ${className}`} style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
      }}>
        {/* Name Field */}
        <MobileFormInput
          type="text"
          name="name"
          label="İsim Soyisim"
          placeholder="Adınız ve soyadınız"
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          onBlur={() => handleBlur('name')}
          error={fieldErrors.name}
          required
          autoComplete="name"
          clearable
          leftIcon="👤"
          maxLength={50}
          showCounter
        />

        {/* Email Field */}
        <MobileFormInput
          type="email"
          name="email"
          label="E-posta"
          placeholder="ornek@email.com"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          onBlur={() => handleBlur('email')}
          error={fieldErrors.email}
          required
          autoComplete="email"
          clearable
          leftIcon="📧"
          suggestions={[
            'gmail.com',
            'hotmail.com',
            'outlook.com',
            'yahoo.com',
            'yandex.com.tr'
          ]}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
      }}>
        {/* Phone Field */}
        <MobilePhoneInput
          name="phone"
          label="Telefon"
          placeholder="Telefon numaranızı girin"
          value={formData.phone}
          onChange={handlePhoneChange}
          onBlur={() => handleBlur('phone')}
          error={fieldErrors.phone}
          required
          defaultCountry="TR"
          preferredCountries={['TR', 'US', 'GB', 'DE', 'FR']}
        />

        {/* Subject Field */}
        <MobileFormInput
          type="text"
          name="subject"
          label="Konu"
          placeholder="Mesajınızın konusu"
          value={formData.subject}
          onChange={(value) => handleInputChange('subject', value)}
          onBlur={() => handleBlur('subject')}
          error={fieldErrors.subject}
          required
          clearable
          leftIcon="📋"
          suggestions={subjectSuggestions}
          maxLength={100}
          showCounter
        />
      </div>

      {/* Message Field */}
      <div style={{ marginBottom: '24px' }}>
        <MobileTextarea
          name="message"
          label="Mesaj"
          placeholder="Mesajınızı buraya yazın..."
          value={formData.message}
          onChange={(value) => handleInputChange('message', value)}
          onBlur={() => handleBlur('message')}
          error={fieldErrors.message}
          required
          rows={5}
          autoResize
          maxLength={1000}
          showCounter
          helperText="Lütfen mesajınızı detaylı olarak açıklayın"
        />
      </div>

      {/* Submit Error */}
      {submitError && (
        <div style={{
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#721c24',
          fontSize: '0.9rem',
        }}>
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || hasErrors}
        style={{
          width: '100%',
          background: isSubmitting || hasErrors ? '#ccc' : '#FD7E14',
          color: '#fff',
          border: 'none',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 600,
          cursor: isSubmitting || hasErrors ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        {isSubmitting ? (
          <>
            <Loading size="small" type="spinner" />
            Gönderiliyor...
          </>
        ) : (
          'Mesaj Gönder'
        )}
      </button>
    </form>
  );
}