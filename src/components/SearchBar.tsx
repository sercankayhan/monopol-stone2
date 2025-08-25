"use client";

import { useState, useCallback, useEffect } from 'react';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import Loading from './Loading';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  link: string;
  type: 'product' | 'page';
  image?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

export default function SearchBar({ 
  placeholder = "Ürün arayın...", 
  onResultSelect,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { executeWithErrorHandling } = useErrorHandling({
    enableLogging: true,
    onError: (error) => {
      console.error('SearchBar error:', error);
      setIsLoading(false);
    }
  });

  const { measureUserInteraction, measureApiCall } = usePerformanceMonitoring('SearchBar');

  // Mock search data - replace with real API call
  const searchData: SearchResult[] = [
    { id: '1', title: 'Mitra Kültür Taşı', description: 'Doğal görünümlü kültür taşı', link: '/urun/kultur-tasi-1', type: 'product' },
    { id: '2', title: 'Tivoli Kültür Taşı', description: 'Modern stil kültür taşı', link: '/urun/kultur-tasi-2', type: 'product' },
    { id: '3', title: 'Luminar Kültür Taşı', description: 'Şık ve zarif kültür taşı', link: '/urun/kultur-tasi-3', type: 'product' },
    { id: '4', title: 'Leon Kültür Tuğlası', description: 'Rustik kültür tuğlası', link: '/urun/kultur-tuglasi-1', type: 'product' },
    { id: '5', title: 'Ürünler', description: 'Tüm ürünleri görüntüle', link: '/urunler', type: 'page' },
    { id: '6', title: 'İletişim', description: 'Bizimle iletişime geçin', link: '/iletisim', type: 'page' },
  ];

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    const searchResults = await executeWithErrorHandling(async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Filter mock data
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return filtered.slice(0, 8); // Limit to 8 results
    }, 'search_products');

    if (searchResults) {
      setResults(searchResults);
      setIsOpen(true);
      setSelectedIndex(-1);
    }

    setIsLoading(false);
  }, [executeWithErrorHandling]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (!value.trim()) {
      setIsOpen(false);
      setResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const endMeasurement = measureUserInteraction('search_result_click');
    
    setQuery(result.title);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    onResultSelect?.(result);
    
    // Navigate to result
    window.location.href = result.link;
    
    endMeasurement();
  };

  const handleFocus = () => {
    const endMeasurement = measureUserInteraction('search_focus');
    if (query.trim() && results.length > 0) {
      setIsOpen(true);
    }
    endMeasurement();
  };

  const handleBlur = () => {
    // Delay to allow result clicks
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className={`search-bar ${className}`} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 40px 12px 16px',
            border: '2px solid #e0e0e0',
            borderRadius: '25px',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            background: '#fff',
          }}
        />
        
        <div style={{
          position: 'absolute',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          {isLoading ? (
            <Loading size="small" type="spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          marginTop: '4px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          {results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < results.length - 1 ? '1px solid #f0f0f0' : 'none',
                  backgroundColor: selectedIndex === index ? '#f8f9fa' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: result.type === 'product' ? '#FD7E14' : '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.2rem',
                  }}>
                    {result.type === 'product' ? '🏗️' : '📄'}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: '#333',
                      marginBottom: '2px',
                    }}>
                      {result.title}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#666',
                      lineHeight: '1.3',
                    }}>
                      {result.description}
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}>
                    {result.type === 'product' ? 'ÜRÜN' : 'SAYFA'}
                  </div>
                </div>
              </div>
            ))
          ) : query.trim() && !isLoading ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              fontSize: '0.9rem',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <div>Sonuç bulunamadı</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                "{query}" için hiçbir sonuç bulunamadı
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}