"use client";

import { useState, useRef, forwardRef } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface MobileTextareaProps {
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
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  autoResize?: boolean;
  showCounter?: boolean;
  helperText?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(({
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
  maxLength,
  minLength,
  rows = 4,
  autoResize = true,
  showCounter = false,
  helperText,
  className = '',
  style = {},
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { measureUserInteraction } = usePerformanceMonitoring('MobileTextarea');

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    const textarea = typeof ref === 'function' ? textareaRef.current : (ref?.current || textareaRef.current);
    if (textarea && autoResize) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // Apply maxLength if provided
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    onChange(newValue);
    
    // Auto-resize after value change
    if (autoResize) {
      setTimeout(autoResizeTextarea, 0);
    }
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const endMeasurement = measureUserInteraction(`textarea_focus_${name}`);
    setIsFocused(true);
    onFocus?.();
    endMeasurement();
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const endMeasurement = measureUserInteraction(`textarea_blur_${name}`);
    setIsFocused(false);
    onBlur?.();
    endMeasurement();
  };

  // Clear textarea
  const clearTextarea = () => {
    const endMeasurement = measureUserInteraction(`textarea_clear_${name}`);
    onChange('');
    const textarea = typeof ref === 'function' ? textareaRef.current : (ref?.current || textareaRef.current);
    textarea?.focus();
    
    if (autoResize) {
      setTimeout(autoResizeTextarea, 0);
    }
    
    endMeasurement();
  };

  return (
    <div className={`mobile-textarea ${className}`} style={{
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

      {/* Textarea Container */}
      <div style={{
        position: 'relative',
      }}>
        {/* Textarea */}
        <textarea
          ref={ref || textareaRef}
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          minLength={minLength}
          maxLength={maxLength}
          rows={rows}
          style={{
            width: '100%',
            padding: '14px',
            paddingRight: value ? '44px' : '14px',
            fontSize: '16px', // Prevents zoom on iOS
            fontFamily: 'Poppins, sans-serif',
            border: `2px solid ${error ? '#e74c3c' : isFocused ? '#FD7E14' : '#e0e0e0'}`,
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: disabled ? '#f8f9fa' : '#fff',
            color: disabled ? '#999' : '#333',
            resize: autoResize ? 'none' : 'vertical',
            minHeight: `${rows * 24}px`,
            
            // Mobile optimizations
            WebkitAppearance: 'none',
            WebkitBorderRadius: '10px',
          }}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={clearTextarea}
            style={{
              position: 'absolute',
              top: '14px',
              right: '12px',
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
              zIndex: 2,
            }}
            aria-label="Temizle"
          >
            ×
          </button>
        )}
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
    </div>
  );
});

MobileTextarea.displayName = 'MobileTextarea';

export default MobileTextarea;