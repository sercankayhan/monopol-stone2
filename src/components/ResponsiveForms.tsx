"use client";

// Responsive Forms Enhancement Component
// Based on CLAUDE.md Part 1 - Safe responsive form implementation

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { useProgressiveEnhancement } from './ProgressiveEnhancement';

// Enhanced Input Component
interface ResponsiveInputProps {
  type?: 'text' | 'email' | 'tel' | 'search' | 'url' | 'password' | 'number';
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoSuggestions?: string[];
  showCharacterCount?: boolean;
  icon?: ReactNode;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ResponsiveInput({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  autoSuggestions = [],
  showCharacterCount = false,
  icon,
  helpText,
  size = 'md'
}: ResponsiveInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const features = useProgressiveEnhancement();

  useEffect(() => {
    if (value && autoSuggestions.length > 0) {
      const filtered = autoSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase()) && suggestion !== value
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && isFocused);
    } else {
      setShowSuggestions(false);
    }
  }, [value, autoSuggestions, isFocused]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setSelectedSuggestionIndex(-1);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    // Delay to allow suggestion clicks
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      onBlur?.();
    }, 150);
  }, [onBlur]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          onChange(filteredSuggestions[selectedSuggestionIndex]);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, filteredSuggestions, selectedSuggestionIndex, onChange]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onChange]);

  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const sizeClasses = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-3 px-4',
    lg: 'text-lg py-4 px-5'
  };

  const inputClasses = [
    'responsive-form-input',
    'w-full rounded-lg border-2 transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size],
    error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' :
    success ? 'border-green-500 focus:border-green-500 focus:ring-green-200' :
    'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
    icon ? 'pl-12' : '',
    'supports-touch:min-h-[44px]' // Ensure touch target size
  ].filter(Boolean).join(' ');

  return (
    <div className="responsive-form-field relative">
      {/* Label */}
      <label
        htmlFor={inputId}
        className={[
          'block font-medium mb-2',
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
          error ? 'text-red-700' : 'text-gray-700',
          required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''
        ].join(' ')}
      >
        {label}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[helpId, errorId].filter(Boolean).join(' ')}
          // Prevent zoom on iOS
          style={{
            fontSize: (features as any).touch && type !== 'number' ? '16px' : undefined
          }}
        />

        {/* Success/Error Icon */}
        {(success || error) && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {success && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {error && (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Auto-suggestions */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
          aria-label="Suggestions"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={[
                'w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors cursor-pointer',
                'focus:bg-blue-50 focus:outline-none',
                'supports-touch:min-h-[44px] supports-touch:flex supports-touch:items-center',
                index === selectedSuggestionIndex ? 'bg-blue-100' : '',
                index !== filteredSuggestions.length - 1 ? 'border-b border-gray-100' : ''
              ].join(' ')}
              role="option"
              aria-selected={index === selectedSuggestionIndex}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
          <span>{value.length} / {maxLength}</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <p id={helpId} className="mt-2 text-sm text-gray-600">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Enhanced Textarea Component
interface ResponsiveTextareaProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  autoResize?: boolean;
  showCharacterCount?: boolean;
  helpText?: string;
}

export function ResponsiveTextarea({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  rows = 4,
  autoResize = false,
  showCharacterCount = false,
  helpText
}: ResponsiveTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const features = useProgressiveEnhancement();

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = helpText ? `${textareaId}-help` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  const textareaClasses = [
    'responsive-form-textarea',
    'w-full rounded-lg border-2 transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'py-3 px-4 text-base',
    'resize-none' + (autoResize ? '' : ' resize-y'),
    error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' :
    success ? 'border-green-500 focus:border-green-500 focus:ring-green-200' :
    'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
    'supports-touch:min-h-[88px]' // Ensure adequate touch area
  ].filter(Boolean).join(' ');

  return (
    <div className="responsive-form-field">
      {/* Label */}
      <label
        htmlFor={textareaId}
        className={[
          'block font-medium mb-2 text-base',
          error ? 'text-red-700' : 'text-gray-700',
          required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''
        ].join(' ')}
      >
        {label}
      </label>

      {/* Textarea Container */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={textareaId}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[helpId, errorId].filter(Boolean).join(' ')}
          // Prevent zoom on iOS
          style={{
            fontSize: (features as any).touch ? '16px' : undefined
          }}
        />

        {/* Success/Error Icon */}
        {(success || error) && (
          <div className="absolute right-4 top-4">
            {success && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {error && (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
          <span>{value.length} / {maxLength}</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <p id={helpId} className="mt-2 text-sm text-gray-600">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Enhanced Select Component
interface ResponsiveSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ResponsiveSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  success,
  required = false,
  disabled = false,
  helpText,
  size = 'md'
}: ResponsiveSelectProps) {
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = helpText ? `${selectId}-help` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  const sizeClasses = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-3 px-4',
    lg: 'text-lg py-4 px-5'
  };

  const selectClasses = [
    'responsive-form-select',
    'w-full rounded-lg border-2 transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'appearance-none bg-no-repeat',
    sizeClasses[size],
    error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' :
    success ? 'border-green-500 focus:border-green-500 focus:ring-green-200' :
    'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
    'supports-touch:min-h-[44px]' // Ensure touch target size
  ].filter(Boolean).join(' ');

  return (
    <div className="responsive-form-field">
      {/* Label */}
      <label
        htmlFor={selectId}
        className={[
          'block font-medium mb-2',
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
          error ? 'text-red-700' : 'text-gray-700',
          required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''
        ].join(' ')}
      >
        {label}
      </label>

      {/* Select Container */}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={selectClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[helpId, errorId].filter(Boolean).join(' ')}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Success/Error Icon */}
        {(success || error) && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            {success && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {error && (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <p id={helpId} className="mt-2 text-sm text-gray-600">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Enhanced Button Component
interface ResponsiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export function ResponsiveButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = ''
}: ResponsiveButtonProps) {
  const baseClasses = [
    'responsive-form-button',
    'inline-flex items-center justify-center',
    'font-medium rounded-lg transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95',
    'supports-touch:min-h-[44px] supports-touch:min-w-[44px]', // Touch target size
    fullWidth ? 'w-full' : ''
  ];

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-5 text-xl'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-200',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200'
  };

  const buttonClasses = [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}

// Form Group Component for layout
interface ResponsiveFormGroupProps {
  children: ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveFormGroup({
  children,
  columns = 1,
  gap = 'md',
  className = ''
}: ResponsiveFormGroupProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  const gridClasses = [
    'responsive-form-group',
    'grid',
    columns > 1 ? `grid-cols-1 md:grid-cols-${columns}` : 'grid-cols-1',
    gapClasses[gap],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}