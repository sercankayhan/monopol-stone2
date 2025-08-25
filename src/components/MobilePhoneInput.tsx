"use client";

import { useState, useRef, forwardRef } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format?: string;
}

interface MobilePhoneInputProps {
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, country: Country) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  defaultCountry?: string;
  preferredCountries?: string[];
  className?: string;
  style?: React.CSSProperties;
}

const countries: Country[] = [
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90', format: '(999) 999 99 99' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', format: '(999) 999-9999' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', format: '9999 999999' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', format: '999 99999999' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', format: '9 99 99 99 99' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34', format: '999 99 99 99' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39', format: '999 999 9999' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', format: '9 99999999' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32', format: '999 99 99 99' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43', format: '999 9999999' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', format: '99 999 99 99' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46', format: '99-999 99 99' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47', format: '999 99 999' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45', format: '99 99 99 99' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358', format: '99 999 9999' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48', format: '999 999 999' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', format: '999 999 999' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', dialCode: '+36', format: '99 999 9999' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30', format: '999 999 9999' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', format: '999 999 999' },
];

const MobilePhoneInput = forwardRef<HTMLInputElement, MobilePhoneInputProps>(({
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  required = false,
  disabled = false,
  autoFocus = false,
  defaultCountry = 'TR',
  preferredCountries = ['TR', 'US', 'GB', 'DE'],
  className = '',
  style = {},
}, ref) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { measureUserInteraction } = usePerformanceMonitoring('MobilePhoneInput');

  // Format phone number based on country format
  const formatPhoneNumber = (phoneNumber: string, format?: string): string => {
    if (!format) return phoneNumber;
    
    const digits = phoneNumber.replace(/\D/g, '');
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
      if (format[i] === '9') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }
    
    return formatted;
  };

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatPhoneNumber(inputValue, selectedCountry.format);
    onChange(formattedValue, selectedCountry);
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    const endMeasurement = measureUserInteraction(`country_select_${country.code}`);
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // Format existing number with new country format
    const digits = value.replace(/\D/g, '');
    const formattedValue = formatPhoneNumber(digits, country.format);
    onChange(formattedValue, country);
    
    // Focus input after country selection
    setTimeout(() => {
      const inputElement = typeof ref === 'function' ? inputRef.current : (ref?.current || inputRef.current);
      inputElement?.focus();
    }, 100);
    
    endMeasurement();
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const endMeasurement = measureUserInteraction(`phone_input_focus_${name}`);
    setIsFocused(true);
    onFocus?.();
    endMeasurement();
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const endMeasurement = measureUserInteraction(`phone_input_blur_${name}`);
    setIsFocused(false);
    onBlur?.();
    
    // Close dropdown with delay to allow selection
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
    
    endMeasurement();
  };

  // Filter countries based on search
  const getFilteredCountries = () => {
    if (!searchQuery) {
      // Show preferred countries first
      const preferred = countries.filter(c => preferredCountries.includes(c.code));
      const others = countries.filter(c => !preferredCountries.includes(c.code));
      return [...preferred, ...others];
    }
    
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
    );
  };

  const filteredCountries = getFilteredCountries();

  return (
    <div className={`mobile-phone-input ${className}`} style={{
      position: 'relative',
      width: '100%',
      ...style,
    }}>
      {/* Label */}
      <label
        htmlFor={name}
        style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: error ? '#e74c3c' : '#333',
          transition: 'color 0.3s ease',
        }}
      >
        {label}
        {required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
      </label>

      {/* Input Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        border: `2px solid ${error ? '#e74c3c' : isFocused ? '#FD7E14' : '#e0e0e0'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backgroundColor: disabled ? '#f8f9fa' : '#fff',
      }}>
        {/* Country Selector */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 12px',
            background: 'transparent',
            border: 'none',
            borderRight: '1px solid #e0e0e0',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            minWidth: '100px',
            transition: 'background 0.3s ease',
          }}
          aria-label={`Selected country: ${selectedCountry.name}`}
        >
          <span style={{ fontSize: '1.2rem' }}>{selectedCountry.flag}</span>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>{selectedCountry.dialCode}</span>
          <span style={{ 
            fontSize: '0.8rem', 
            color: '#999',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}>
            ▼
          </span>
        </button>

        {/* Phone Input */}
        <input
          ref={ref || inputRef}
          type="tel"
          id={name}
          name={name}
          value={value}
          placeholder={placeholder || selectedCountry.format?.replace(/9/g, '0')}
          onChange={handlePhoneChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          inputMode="tel"
          autoComplete="tel"
          style={{
            flex: 1,
            padding: '14px',
            border: 'none',
            outline: 'none',
            fontSize: '16px', // Prevents zoom on iOS
            fontFamily: 'Poppins, sans-serif',
            backgroundColor: 'transparent',
            color: disabled ? '#999' : '#333',
          }}
        />
      </div>

      {/* Country Dropdown */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '2px solid #e0e0e0',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {/* Search Box */}
          <div style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
            <input
              type="text"
              placeholder="Ülke ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Countries List */}
          <div>
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  textAlign: 'left',
                  transition: 'background 0.2s ease',
                  borderBottom: '1px solid #f8f9fa',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '1.2rem' }}>{country.flag}</span>
                <span style={{ flex: 1 }}>{country.name}</span>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>{country.dialCode}</span>
              </button>
            ))}
          </div>

          {filteredCountries.length === 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              fontSize: '0.9rem',
            }}>
              Ülke bulunamadı
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          color: '#e74c3c',
          fontSize: '0.85rem',
          marginTop: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Format Helper */}
      {!error && selectedCountry.format && (
        <div style={{
          color: '#666',
          fontSize: '0.8rem',
          marginTop: '4px',
        }}>
          Format: {selectedCountry.format.replace(/9/g, '0')}
        </div>
      )}
    </div>
  );
});

MobilePhoneInput.displayName = 'MobilePhoneInput';

export default MobilePhoneInput;