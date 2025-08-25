"use client";

import { useState, useRef, useEffect, forwardRef } from 'react';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface MobileFormInputProps {
  type?: 'text' | 'email' | 'tel' | 'password' | 'search' | 'url' | 'number';
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  mask?: string; // Phone mask: (999) 999-9999
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  suggestions?: string[]; // Auto-suggestions
  showCounter?: boolean;
  clearable?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MobileFormInput = forwardRef<HTMLInputElement, MobileFormInputProps>(({
  type = 'text',
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
  autoComplete,
  autoFocus = false,
  mask,
  maxLength,
  minLength,
  pattern,
  suggestions = [],
  showCounter = false,
  clearable = false,
  leftIcon,
  rightIcon,
  helperText,
  className = '',
  style = {},
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { handleError } = useErrorHandling({
    enableLogging: true,
    onError: (error) => {
      console.error(`MobileFormInput error for ${name}:`, error);
    }
  });

  const { measureUserInteraction } = usePerformanceMonitoring('MobileFormInput');

  // Handle input masking
  const applyMask = (inputValue: string, maskPattern: string): string => {
    if (!maskPattern) return inputValue;
    
    const numbers = inputValue.replace(/\D/g, '');
    let maskedValue = '';
    let numberIndex = 0;
    
    for (let i = 0; i < maskPattern.length && numberIndex < numbers.length; i++) {
      if (maskPattern[i] === '9') {
        maskedValue += numbers[numberIndex];
        numberIndex++;
      } else {
        maskedValue += maskPattern[i];
      }
    }
    
    return maskedValue;
  };

  // Handle input change with masking
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Apply mask if provided
    if (mask) {
      newValue = applyMask(newValue, mask);
    }
    
    // Apply maxLength if provided
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    onChange(newValue);
    
    // Handle suggestions
    if (suggestions.length > 0 && newValue.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const endMeasurement = measureUserInteraction(`input_focus_${name}`);
    setIsFocused(true);
    onFocus?.();
    endMeasurement();
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const endMeasurement = measureUserInteraction(`input_blur_${name}`);
    setIsFocused(false);
    onBlur?.();
    
    // Hide suggestions with delay to allow selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
    
    endMeasurement();
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Select suggestion
  const selectSuggestion = (suggestion: string) => {
    const endMeasurement = measureUserInteraction(`suggestion_select_${name}`);
    onChange(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    endMeasurement();
  };

  // Clear input
  const clearInput = () => {
    const endMeasurement = measureUserInteraction(`input_clear_${name}`);
    onChange('');
    inputRef.current?.focus();
    endMeasurement();
  };

  // Get input type attributes for mobile keyboards
  const getInputAttributes = () => {
    const attributes: any = {
      type,
      name,
      value,
      placeholder,
      required,
      disabled,
      autoComplete,
      autoFocus,
      pattern,
      minLength,
      maxLength,
    };

    // Add mobile-specific attributes
    switch (type) {
      case 'tel':
        attributes.inputMode = 'tel';
        attributes.autoComplete = autoComplete || 'tel';
        break;
      case 'email':
        attributes.inputMode = 'email';
        attributes.autoComplete = autoComplete || 'email';
        break;
      case 'search':
        attributes.inputMode = 'search';
        attributes.autoComplete = autoComplete || 'off';
        break;
      case 'url':
        attributes.inputMode = 'url';
        attributes.autoComplete = autoComplete || 'url';
        break;
      case 'number':
        attributes.inputMode = 'numeric';
        attributes.pattern = pattern || '[0-9]*';
        break;
      default:
        attributes.inputMode = 'text';
    }

    return attributes;
  };

  return (
    <div className={`mobile-form-input ${className}`} style={{
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
        alignItems: 'center',
      }}>
        {/* Left Icon */}
        {leftIcon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            zIndex: 2,
            color: '#666',
            fontSize: '1.1rem',
          }}>
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref || inputRef}
          {...getInputAttributes()}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: leftIcon ? '14px 50px 14px 44px' : (rightIcon || clearable) ? '14px 44px 14px 14px' : '14px',
            fontSize: '1rem',
            border: `2px solid ${error ? '#e74c3c' : isFocused ? '#FD7E14' : '#e0e0e0'}`,
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: disabled ? '#f8f9fa' : '#fff',
            color: disabled ? '#999' : '#333',
            fontFamily: 'Poppins, sans-serif',
            
            // Mobile optimizations
            WebkitAppearance: 'none',
            WebkitBorderRadius: '10px'
          }}
        />

        {/* Right Icons */}
        <div style={{
          position: 'absolute',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 2,
        }}>
          {/* Clear Button */}
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={clearInput}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '1.2rem',
                minWidth: '24px',
                minHeight: '24px',
              }}
              aria-label="Temizle"
            >
              ×
            </button>
          )}
          
          {/* Right Icon */}
          {rightIcon && (
            <div style={{
              color: '#666',
              fontSize: '1.1rem',
            }}>
              {rightIcon}
            </div>
          )}
        </div>
      </div>

      {/* Character Counter */}
      {showCounter && maxLength && (
        <div style={{
          textAlign: 'right',
          fontSize: '0.8rem',
          color: value.length > maxLength * 0.9 ? '#e74c3c' : '#999',
          marginTop: '4px',
        }}>
          {value.length}/{maxLength}
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

      {/* Helper Text */}
      {helperText && !error && (
        <div style={{
          color: '#666',
          fontSize: '0.85rem',
          marginTop: '6px',
        }}>
          {helperText}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
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
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: selectedSuggestionIndex === index ? '#f8f9fa' : 'transparent',
                borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.2s ease',
                fontSize: '0.95rem',
              }}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

MobileFormInput.displayName = 'MobileFormInput';

export default MobileFormInput;