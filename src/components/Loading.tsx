"use client";

import { CSSProperties } from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  type = 'spinner',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizes = {
    small: { width: '20px', height: '20px', fontSize: '0.85rem' },
    medium: { width: '40px', height: '40px', fontSize: '1rem' },
    large: { width: '60px', height: '60px', fontSize: '1.2rem' },
  };

  const currentSize = sizes[size];

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(2px)',
      zIndex: 9999,
    }),
  };

  // Spinner Component
  const SpinnerLoader = () => (
    <div
      style={{
        width: currentSize.width,
        height: currentSize.height,
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #FD7E14',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );

  // Dots Loader
  const DotsLoader = () => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#FD7E14',
            animation: `dotPulse 1.4s ease-in-out ${i * 0.16}s infinite both`,
          }}
        />
      ))}
    </div>
  );

  // Pulse Loader
  const PulseLoader = () => (
    <div
      style={{
        width: currentSize.width,
        height: currentSize.height,
        borderRadius: '50%',
        background: '#FD7E14',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  );

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div
      style={{
        width: '200px',
        height: '20px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton 1.5s ease-in-out infinite',
        borderRadius: '4px',
      }}
    />
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'skeleton':
        return <SkeletonLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes dotPulse {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
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
        
        @keyframes skeleton {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
      `}</style>

      <div className={className} style={containerStyle}>
        {renderLoader()}
        {text && (
          <span
            style={{
              color: '#666',
              fontSize: currentSize.fontSize,
              fontWeight: 500,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {text}
          </span>
        )}
      </div>
    </>
  );
};

export default Loading;

// Skeleton components for specific use cases
export const ProductCardSkeleton = () => (
  <div style={{
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  }}>
    <div style={{
      width: '100%',
      height: '200px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton 1.5s ease-in-out infinite',
      borderRadius: '8px',
      marginBottom: '16px',
    }} />
    <div style={{
      width: '60%',
      height: '20px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton 1.5s ease-in-out infinite',
      borderRadius: '4px',
      marginBottom: '8px',
    }} />
    <div style={{
      width: '80%',
      height: '16px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton 1.5s ease-in-out infinite',
      borderRadius: '4px',
    }} />
  </div>
);

export const ImageSkeleton = ({ width = '100%', height = '200px' }: { width?: string; height?: string }) => (
  <div style={{
    width,
    height,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton 1.5s ease-in-out infinite',
    borderRadius: '8px',
  }} />
);