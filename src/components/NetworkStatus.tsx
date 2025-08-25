"use client";

import { useState, useEffect } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface NetworkInfo {
  online: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface NetworkStatusProps {
  showIndicator?: boolean;
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  hideDelay?: number;
}

export default function NetworkStatus({
  showIndicator = true,
  position = 'top',
  autoHide = true,
  hideDelay = 3000,
}: NetworkStatusProps) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    online: true,
  });
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  const { trackMetric } = usePerformanceMonitoring('NetworkStatus');

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection;
      
      const newNetworkInfo: NetworkInfo = {
        online: navigator.onLine,
        connectionType: connection?.type,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      };

      setNetworkInfo(prevInfo => {
        // Track network changes
        if (prevInfo.online !== newNetworkInfo.online) {
          trackMetric('network_status_change', newNetworkInfo.online ? 1 : 0, 'boolean');
          
          if (newNetworkInfo.online) {
            setShowOnlineMessage(true);
            setShowOfflineMessage(false);
            if (autoHide) {
              setTimeout(() => setShowOnlineMessage(false), hideDelay);
            }
          } else {
            setShowOfflineMessage(true);
            setShowOnlineMessage(false);
          }
        }

        // Track connection quality changes
        if (prevInfo.effectiveType !== newNetworkInfo.effectiveType) {
          trackMetric('connection_type_change', 1, 'count');
          console.log('[Network] Connection type changed:', newNetworkInfo.effectiveType);
        }

        return newNetworkInfo;
      });
    };

    // Initial check
    updateNetworkInfo();

    // Listen for network events
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [trackMetric, autoHide, hideDelay]);

  // Get connection quality indicator
  const getConnectionQuality = (): 'excellent' | 'good' | 'poor' | 'offline' => {
    if (!networkInfo.online) return 'offline';
    
    const { effectiveType, downlink } = networkInfo;
    
    if (effectiveType === '4g' && (downlink || 0) > 1.5) return 'excellent';
    if (effectiveType === '4g' || (downlink || 0) > 0.5) return 'good';
    return 'poor';
  };

  const connectionQuality = getConnectionQuality();

  // Get status color
  const getStatusColor = () => {
    switch (connectionQuality) {
      case 'excellent': return '#28a745';
      case 'good': return '#ffc107';
      case 'poor': return '#fd7e14';
      case 'offline': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Mükemmel Bağlantı';
      case 'good': return 'İyi Bağlantı';
      case 'poor': return 'Yavaş Bağlantı';
      case 'offline': return 'Çevrimdışı';
      default: return 'Bilinmiyor';
    }
  };

  // Format connection info
  const formatConnectionInfo = () => {
    const { effectiveType, downlink, rtt } = networkInfo;
    const parts = [];
    
    if (effectiveType) parts.push(effectiveType.toUpperCase());
    if (downlink) parts.push(`${downlink.toFixed(1)} Mbps`);
    if (rtt) parts.push(`${rtt}ms`);
    
    return parts.join(' • ');
  };

  if (!showIndicator && !showOfflineMessage && !showOnlineMessage) {
    return null;
  }

  return (
    <>
      {/* Persistent Status Indicator */}
      {showIndicator && (
        <div
          style={{
            position: 'fixed',
            [position]: '10px',
            right: '10px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '8px 12px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: '#333',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Connection dot */}
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getStatusColor(),
              animation: connectionQuality === 'offline' ? 'pulse 1s infinite' : 'none',
            }}
          />
          
          {/* Connection info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {getStatusText()}
            </div>
            {networkInfo.online && (
              <div style={{ fontSize: '0.7rem', color: '#666' }}>
                {formatConnectionInfo()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offline Message */}
      {showOfflineMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#dc3545',
            color: '#fff',
            padding: '12px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 10000,
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          🔌 İnternet bağlantısı yok - Çevrimdışı çalışıyorsunuz
        </div>
      )}

      {/* Online Message */}
      {showOnlineMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#28a745',
            color: '#fff',
            padding: '12px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 10000,
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          ✅ İnternet bağlantısı yeniden kuruldu
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}

// Hook for network status
export function useNetworkStatus() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection;
      
      setNetworkInfo({
        online: navigator.onLine,
        connectionType: connection?.type,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      });
    };

    updateNetworkInfo();

    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
}

// Network-aware data fetching
export function useNetworkAwareFetch() {
  const networkInfo = useNetworkStatus();

  const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<Response> => {
    const { saveData } = networkInfo;
    
    // Optimize request based on connection
    const optimizedOptions = {
      ...options,
      headers: {
        ...options.headers,
        // Request lower quality images on slow connections
        ...(saveData && { 'Save-Data': 'on' }),
      },
    };

    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await fetch(url, optimizedOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  };

  return { fetchWithRetry, networkInfo };
}