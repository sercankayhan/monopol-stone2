"use client";

// Touch Gesture Enhancement System
// Based on CLAUDE.md Part 1 - Safe touch interaction implementation

import React, { useRef, useCallback, useEffect, useState } from 'react';

// Touch gesture types
interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
  startPoint: TouchPoint;
  endPoint: TouchPoint;
}

interface PinchEvent {
  scale: number;
  center: TouchPoint;
  velocity: number;
}

interface TapEvent {
  point: TouchPoint;
  tapCount: number;
}

interface PanEvent {
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  center: TouchPoint;
}

// Touch gesture options
interface TouchGestureOptions {
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableTap?: boolean;
  enableDoubleTap?: boolean;
  enablePan?: boolean;
  enableLongPress?: boolean;
  swipeThreshold?: number;
  tapTimeout?: number;
  doubleTapTimeout?: number;
  longPressTimeout?: number;
  preventDefaultEvents?: boolean;
  stopPropagation?: boolean;
}

// Touch gesture handlers
interface TouchGestureHandlers {
  onSwipe?: (event: SwipeEvent) => void;
  onPinch?: (event: PinchEvent) => void;
  onTap?: (event: TapEvent) => void;
  onDoubleTap?: (event: TapEvent) => void;
  onPan?: (event: PanEvent) => void;
  onPanStart?: (event: PanEvent) => void;
  onPanEnd?: (event: PanEvent) => void;
  onLongPress?: (event: TapEvent) => void;
  onTouchStart?: (event: TouchEvent) => void;
  onTouchEnd?: (event: TouchEvent) => void;
}

// Hook for touch gestures
export function useTouchGestures(
  options: TouchGestureOptions = {},
  handlers: TouchGestureHandlers = {}
) {
  const elementRef = useRef<HTMLElement>(null);
  const touchStart = useRef<TouchPoint | null>(null);
  const touchCurrent = useRef<TouchPoint | null>(null);
  const touchStartTime = useRef<number>(0);
  const lastTapTime = useRef<number>(0);
  const tapCount = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isPanning = useRef<boolean>(false);
  const initialDistance = useRef<number>(0);
  const currentDistance = useRef<number>(0);

  const {
    enableSwipe = true,
    enablePinch = true,
    enableTap = true,
    enableDoubleTap = true,
    enablePan = true,
    enableLongPress = true,
    swipeThreshold = 50,
    tapTimeout = 300,
    doubleTapTimeout = 400,
    longPressTimeout = 500,
    preventDefaultEvents = false,
    stopPropagation = false
  } = options;

  const getTouchPoint = useCallback((touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  }), []);

  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }, []);

  const getCenter = useCallback((touches: TouchList): TouchPoint => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < touches.length; i++) {
      x += touches[i].clientX;
      y += touches[i].clientY;
    }
    return {
      x: x / touches.length,
      y: y / touches.length,
      timestamp: Date.now()
    };
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (preventDefaultEvents) {
      event.preventDefault();
    }
    if (stopPropagation) {
      event.stopPropagation();
    }

    handlers.onTouchStart?.(event);

    const touch = event.touches[0];
    touchStart.current = getTouchPoint(touch);
    touchCurrent.current = touchStart.current;
    touchStartTime.current = Date.now();
    isPanning.current = false;

    // Handle multi-touch for pinch
    if (event.touches.length === 2 && enablePinch) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      initialDistance.current = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }

    // Start long press timer
    if (enableLongPress && event.touches.length === 1) {
      longPressTimer.current = setTimeout(() => {
        if (touchStart.current && !isPanning.current) {
          handlers.onLongPress?.({
            point: touchStart.current,
            tapCount: 1
          });
        }
      }, longPressTimeout);
    }
  }, [
    preventDefaultEvents,
    stopPropagation,
    handlers,
    getTouchPoint,
    enablePinch,
    enableLongPress,
    longPressTimeout
  ]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchStart.current) return;

    if (preventDefaultEvents) {
      event.preventDefault();
    }
    if (stopPropagation) {
      event.stopPropagation();
    }

    const touch = event.touches[0];
    touchCurrent.current = getTouchPoint(touch);

    // Clear long press timer if moving
    if (longPressTimer.current) {
      clearLongPressTimer();
    }

    // Handle pinch gesture
    if (event.touches.length === 2 && enablePinch) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      currentDistance.current = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (initialDistance.current > 0) {
        const scale = currentDistance.current / initialDistance.current;
        const center = getCenter(event.touches);
        const velocity = Math.abs(currentDistance.current - initialDistance.current) / 
                        (Date.now() - touchStartTime.current);

        handlers.onPinch?.({
          scale,
          center,
          velocity
        });
      }
      return;
    }

    // Handle pan gesture
    if (enablePan && event.touches.length === 1) {
      const deltaX = touchCurrent.current.x - touchStart.current.x;
      const deltaY = touchCurrent.current.y - touchStart.current.y;
      const duration = Date.now() - touchStartTime.current;
      const velocityX = Math.abs(deltaX) / duration;
      const velocityY = Math.abs(deltaY) / duration;

      if (!isPanning.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        isPanning.current = true;
        handlers.onPanStart?.({
          deltaX,
          deltaY,
          velocityX,
          velocityY,
          center: touchCurrent.current
        });
      }

      if (isPanning.current) {
        handlers.onPan?.({
          deltaX,
          deltaY,
          velocityX,
          velocityY,
          center: touchCurrent.current
        });
      }
    }
  }, [
    preventDefaultEvents,
    stopPropagation,
    getTouchPoint,
    clearLongPressTimer,
    enablePinch,
    enablePan,
    getCenter,
    handlers
  ]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (preventDefaultEvents) {
      event.preventDefault();
    }
    if (stopPropagation) {
      event.stopPropagation();
    }

    handlers.onTouchEnd?.(event);

    clearLongPressTimer();

    if (!touchStart.current || !touchCurrent.current) return;

    const duration = Date.now() - touchStartTime.current;
    const deltaX = touchCurrent.current.x - touchStart.current.x;
    const deltaY = touchCurrent.current.y - touchStart.current.y;
    const distance = getDistance(touchStart.current, touchCurrent.current);
    const velocity = distance / duration;

    // Handle pan end
    if (isPanning.current && enablePan) {
      handlers.onPanEnd?.({
        deltaX,
        deltaY,
        velocityX: Math.abs(deltaX) / duration,
        velocityY: Math.abs(deltaY) / duration,
        center: touchCurrent.current
      });
      isPanning.current = false;
    }

    // Handle swipe gesture
    if (enableSwipe && distance > swipeThreshold && velocity > 0.5) {
      let direction: 'left' | 'right' | 'up' | 'down';
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      handlers.onSwipe?.({
        direction,
        distance,
        velocity,
        duration,
        startPoint: touchStart.current,
        endPoint: touchCurrent.current
      });
    }
    
    // Handle tap gestures
    else if (enableTap && distance < 20 && duration < tapTimeout) {
      const currentTime = Date.now();
      
      if (enableDoubleTap && currentTime - lastTapTime.current < doubleTapTimeout) {
        tapCount.current += 1;
        if (tapCount.current === 2) {
          handlers.onDoubleTap?.({
            point: touchCurrent.current,
            tapCount: tapCount.current
          });
          tapCount.current = 0;
        }
      } else {
        tapCount.current = 1;
        setTimeout(() => {
          if (tapCount.current === 1) {
            handlers.onTap?.({
              point: touchCurrent.current!,
              tapCount: tapCount.current
            });
          }
          tapCount.current = 0;
        }, doubleTapTimeout);
      }
      
      lastTapTime.current = currentTime;
    }

    // Reset state
    touchStart.current = null;
    touchCurrent.current = null;
    initialDistance.current = 0;
    currentDistance.current = 0;
  }, [
    preventDefaultEvents,
    stopPropagation,
    handlers,
    clearLongPressTimer,
    getDistance,
    enablePan,
    enableSwipe,
    swipeThreshold,
    enableTap,
    tapTimeout,
    enableDoubleTap,
    doubleTapTimeout
  ]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive listeners for better performance
    const options = { passive: !preventDefaultEvents };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefaultEvents, clearLongPressTimer]);

  return elementRef;
}

// Touch-enhanced component wrapper
interface TouchEnhancedProps {
  children: React.ReactNode;
  className?: string;
  options?: TouchGestureOptions;
  handlers?: TouchGestureHandlers;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

export const TouchEnhanced: React.FC<TouchEnhancedProps> = ({
  children,
  className = '',
  options = {},
  handlers = {},
  as: Component = 'div',
  style = {}
}) => {
  const ref = useTouchGestures(options, handlers);

  return React.createElement(
    Component,
    {
      ref,
      className: `touch-enhanced ${className}`,
      style: {
        touchAction: 'manipulation',
        userSelect: 'none',
        ...style
      }
    },
    children
  );
};

// Touch-optimized button component
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  onLongPress,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md',
  style = {}
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleTap = useCallback((event: TapEvent) => {
    if (disabled) return;
    
    // Create ripple effect
    const rippleId = Date.now();
    setRipples(prev => [...prev, { id: rippleId, x: event.point.x, y: event.point.y }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
    }, 600);
    
    onClick?.();
  }, [disabled, onClick]);

  const handleLongPress = useCallback((event: TapEvent) => {
    if (disabled) return;
    onLongPress?.();
  }, [disabled, onLongPress]);

  const ref = useTouchGestures(
    {
      enableTap: true,
      enableLongPress: !!onLongPress,
      preventDefaultEvents: true
    },
    {
      onTap: handleTap,
      onLongPress: handleLongPress,
      onTouchStart: () => setIsPressed(true),
      onTouchEnd: () => setIsPressed(false)
    }
  );

  const buttonClasses = [
    'touch-button',
    `touch-button-${variant}`,
    `touch-button-${size}`,
    disabled && 'touch-button-disabled',
    isPressed && 'touch-button-pressed',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={buttonClasses}
      disabled={disabled}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="touch-ripple"
          style={{
            left: ripple.x,
            top: ripple.y
          }}
        />
      ))}
    </button>
  );
};

// Swipeable container component
interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
  style?: React.CSSProperties;
}

export const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  threshold = 50,
  style = {}
}) => {
  const handleSwipe = useCallback((event: SwipeEvent) => {
    switch (event.direction) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const ref = useTouchGestures(
    {
      enableSwipe: true,
      swipeThreshold: threshold,
      enableTap: false,
      enablePan: false
    },
    {
      onSwipe: handleSwipe
    }
  );

  return (
    <div
      ref={ref}
      className={`swipeable-container ${className}`}
      style={{
        touchAction: 'pan-y',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default {
  useTouchGestures,
  TouchEnhanced,
  TouchButton,
  SwipeableContainer
};