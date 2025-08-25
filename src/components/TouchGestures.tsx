"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface TouchGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
  onDoubleTap?: () => void;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function TouchGestures({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchIn,
  onPinchOut,
  onDoubleTap,
  threshold = 50,
  className = '',
  style = {},
}: TouchGesturesProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);

  const { measureUserInteraction } = usePerformanceMonitoring('TouchGestures');

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    } else if (e.touches.length === 2 && (onPinchIn || onPinchOut)) {
      // Pinch gesture
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      pinchStartRef.current = {
        distance,
        scale: 1,
      };
    }
  }, [getTouchDistance, onPinchIn, onPinchOut]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current && (onPinchIn || onPinchOut)) {
      e.preventDefault(); // Prevent default zoom behavior
      
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / pinchStartRef.current.distance;
      
      if (scale > 1.1 && onPinchOut) {
        const endMeasurement = measureUserInteraction('pinch_out');
        onPinchOut(scale);
        endMeasurement();
      } else if (scale < 0.9 && onPinchIn) {
        const endMeasurement = measureUserInteraction('pinch_in');
        onPinchIn(scale);
        endMeasurement();
      }
    }
  }, [getTouchDistance, onPinchIn, onPinchOut, measureUserInteraction]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.changedTouches.length === 1 && touchStartRef.current) {
      const touch = e.changedTouches[0];
      const endTime = Date.now();
      const deltaTime = endTime - touchStartRef.current.time;
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      // Check for double tap
      if (onDoubleTap && deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        const timeSinceLastTap = endTime - lastTapRef.current;
        if (timeSinceLastTap < 500) {
          const endMeasurement = measureUserInteraction('double_tap');
          onDoubleTap();
          endMeasurement();
          lastTapRef.current = 0; // Reset to prevent triple tap
          return;
        } else {
          lastTapRef.current = endTime;
        }
      }
      
      // Check for swipe gestures
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      if (absDeltaX > threshold || absDeltaY > threshold) {
        // Determine swipe direction
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            const endMeasurement = measureUserInteraction('swipe_right');
            onSwipeRight();
            endMeasurement();
          } else if (deltaX < 0 && onSwipeLeft) {
            const endMeasurement = measureUserInteraction('swipe_left');
            onSwipeLeft();
            endMeasurement();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            const endMeasurement = measureUserInteraction('swipe_down');
            onSwipeDown();
            endMeasurement();
          } else if (deltaY < 0 && onSwipeUp) {
            const endMeasurement = measureUserInteraction('swipe_up');
            onSwipeUp();
            endMeasurement();
          }
        }
      }
      
      touchStartRef.current = null;
    }
    
    if (e.touches.length === 0) {
      pinchStartRef.current = null;
    }
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onDoubleTap,
    threshold,
    measureUserInteraction,
  ]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners with passive: false for preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        touchAction: 'none', // Disable default touch behaviors
        userSelect: 'none',   // Prevent text selection
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Hook for easy swipe detection on any element
export const useSwipeGestures = (
  elementRef: React.RefObject<HTMLElement>,
  options: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number;
  }
) => {
  const { measureUserInteraction } = usePerformanceMonitoring('SwipeHook');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1 && touchStartRef.current) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const threshold = options.threshold || 50;
        
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        if (absDeltaX > threshold || absDeltaY > threshold) {
          if (absDeltaX > absDeltaY) {
            if (deltaX > 0 && options.onSwipeRight) {
              const endMeasurement = measureUserInteraction('hook_swipe_right');
              options.onSwipeRight();
              endMeasurement();
            } else if (deltaX < 0 && options.onSwipeLeft) {
              const endMeasurement = measureUserInteraction('hook_swipe_left');
              options.onSwipeLeft();
              endMeasurement();
            }
          } else {
            if (deltaY > 0 && options.onSwipeDown) {
              const endMeasurement = measureUserInteraction('hook_swipe_down');
              options.onSwipeDown();
              endMeasurement();
            } else if (deltaY < 0 && options.onSwipeUp) {
              const endMeasurement = measureUserInteraction('hook_swipe_up');
              options.onSwipeUp();
              endMeasurement();
            }
          }
        }
        
        touchStartRef.current = null;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [options, measureUserInteraction]);
};