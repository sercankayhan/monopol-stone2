"use client";

// Responsive Animation Library
// Based on CLAUDE.md Part 1 - Safe animation implementation with performance optimization

import React, { useRef, useEffect, useState, useCallback, ReactNode } from 'react';

// Animation configuration interfaces
interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

interface ScrollAnimationConfig extends AnimationConfig {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface ResponsiveAnimationConfig extends AnimationConfig {
  breakpoints?: {
    xs?: Partial<AnimationConfig>;
    sm?: Partial<AnimationConfig>;
    md?: Partial<AnimationConfig>;
    lg?: Partial<AnimationConfig>;
    xl?: Partial<AnimationConfig>;
  };
  enabledOnMobile?: boolean;
  reducedMotionFallback?: 'none' | 'fade' | 'scale';
}

// Animation presets
const ANIMATION_PRESETS = {
  // Entrance animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  fadeInUp: {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  fadeInDown: {
    from: { opacity: 0, transform: 'translateY(-30px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  fadeInLeft: {
    from: { opacity: 0, transform: 'translateX(-30px)' },
    to: { opacity: 1, transform: 'translateX(0)' }
  },
  fadeInRight: {
    from: { opacity: 0, transform: 'translateX(30px)' },
    to: { opacity: 1, transform: 'translateX(0)' }
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' }
  },
  slideInUp: {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' }
  },
  slideInDown: {
    from: { transform: 'translateY(-100%)' },
    to: { transform: 'translateY(0)' }
  },
  zoomIn: {
    from: { opacity: 0, transform: 'scale(0.3)' },
    to: { opacity: 1, transform: 'scale(1)' }
  },
  rotateIn: {
    from: { opacity: 0, transform: 'rotate(-180deg)' },
    to: { opacity: 1, transform: 'rotate(0deg)' }
  },
  
  // Exit animations
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 }
  },
  slideOutUp: {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(-100%)' }
  },
  slideOutDown: {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(100%)' }
  },
  zoomOut: {
    from: { opacity: 1, transform: 'scale(1)' },
    to: { opacity: 0, transform: 'scale(0.3)' }
  },
  
  // Attention seekers
  bounce: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-30px)' },
      { transform: 'translateY(0)' },
      { transform: 'translateY(-15px)' },
      { transform: 'translateY(0)' }
    ]
  },
  pulse: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ]
  },
  shake: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0)' }
    ]
  },
  wobble: {
    keyframes: [
      { transform: 'translateX(0%) rotate(0deg)' },
      { transform: 'translateX(-25%) rotate(-5deg)' },
      { transform: 'translateX(20%) rotate(3deg)' },
      { transform: 'translateX(-15%) rotate(-3deg)' },
      { transform: 'translateX(10%) rotate(2deg)' },
      { transform: 'translateX(0%) rotate(0deg)' }
    ]
  },
  
  // Loading animations
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' }
  },
  loading: {
    keyframes: [
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0.3 },
      { transform: 'scale(0)', opacity: 1 }
    ]
  }
} as const;

// Utility functions
const getBreakpoint = (width: number): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  return 'xl';
};

const mergeConfigs = (base: AnimationConfig, override: Partial<AnimationConfig>): AnimationConfig => ({
  ...base,
  ...override
});

const respectsReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window;
};

// Hook for responsive animations
export function useResponsiveAnimation() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setCurrentBreakpoint(getBreakpoint(width));
      setIsMobile(width < 768 || isTouchDevice());
    };

    const updateMotionPreference = () => {
      setPrefersReducedMotion(respectsReducedMotion());
    };

    updateBreakpoint();
    updateMotionPreference();

    window.addEventListener('resize', updateBreakpoint);
    
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addListener(updateMotionPreference);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
      motionMediaQuery.removeListener(updateMotionPreference);
    };
  }, []);

  return {
    currentBreakpoint,
    prefersReducedMotion,
    isMobile,
    shouldAnimate: (config: ResponsiveAnimationConfig) => {
      if (prefersReducedMotion && config.reducedMotionFallback === 'none') {
        return false;
      }
      if (isMobile && !config.enabledOnMobile) {
        return false;
      }
      return true;
    },
    getBreakpointConfig: (config: ResponsiveAnimationConfig) => {
      const breakpointConfig = config.breakpoints?.[currentBreakpoint];
      return breakpointConfig ? mergeConfigs(config, breakpointConfig) : config;
    }
  };
}

// Animated component wrapper
interface AnimatedProps {
  children: ReactNode;
  animation: keyof typeof ANIMATION_PRESETS | 'custom';
  config?: ResponsiveAnimationConfig;
  customKeyframes?: Keyframe[];
  trigger?: 'immediate' | 'scroll' | 'hover' | 'click';
  scrollConfig?: ScrollAnimationConfig;
  className?: string;
  style?: React.CSSProperties;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

export const Animated: React.FC<AnimatedProps> = ({
  children,
  animation,
  config = {},
  customKeyframes,
  trigger = 'immediate',
  scrollConfig,
  className = '',
  style = {},
  onAnimationStart,
  onAnimationEnd
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(trigger === 'immediate');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<Animation | null>(null);
  
  const { shouldAnimate, getBreakpointConfig, prefersReducedMotion } = useResponsiveAnimation();

  const getAnimationKeyframes = useCallback(() => {
    if (animation === 'custom' && customKeyframes) {
      return customKeyframes;
    }
    
    const preset = ANIMATION_PRESETS[animation];
    if (!preset) return [];

    if ('keyframes' in preset) {
      return preset.keyframes;
    }

    return [preset.from, preset.to];
  }, [animation, customKeyframes]);

  const createAnimation = useCallback(() => {
    if (!elementRef.current || !shouldAnimate(config)) return;

    const finalConfig = getBreakpointConfig(config);
    const keyframes = getAnimationKeyframes();

    if (keyframes.length === 0) return;

    // Handle reduced motion
    if (prefersReducedMotion && config.reducedMotionFallback !== 'none') {
      const fallbackKeyframes = config.reducedMotionFallback === 'fade' 
        ? [{ opacity: 0 }, { opacity: 1 }]
        : config.reducedMotionFallback === 'scale'
        ? [{ transform: 'scale(0.95)' }, { transform: 'scale(1)' }]
        : keyframes;
      
      const reducedDuration = Math.min(finalConfig.duration || 600, 200);
      
      animationRef.current = elementRef.current.animate(fallbackKeyframes, {
        duration: reducedDuration,
        delay: finalConfig.delay || 0,
        easing: 'ease-out',
        fill: finalConfig.fillMode || 'both'
      });
    } else {
      animationRef.current = elementRef.current.animate(keyframes, {
        duration: finalConfig.duration || 600,
        delay: finalConfig.delay || 0,
        easing: finalConfig.easing || 'ease-out',
        iterations: finalConfig.iterations || 1,
        direction: finalConfig.direction || 'normal',
        fill: finalConfig.fillMode || 'both'
      });
    }

    setIsAnimating(true);
    onAnimationStart?.();

    animationRef.current.addEventListener('finish', () => {
      setIsAnimating(false);
      onAnimationEnd?.();
    });

    return animationRef.current;
  }, [config, shouldAnimate, getBreakpointConfig, getAnimationKeyframes, prefersReducedMotion, onAnimationStart, onAnimationEnd]);

  // Intersection Observer for scroll trigger
  useEffect(() => {
    if (trigger !== 'scroll' || !elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            if (scrollConfig?.triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!entry.isIntersecting && !scrollConfig?.triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: scrollConfig?.threshold || 0.1,
        rootMargin: scrollConfig?.rootMargin || '0px'
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [trigger, isVisible, scrollConfig]);

  // Create animation when visibility changes
  useEffect(() => {
    if (isVisible && !isAnimating) {
      createAnimation();
    }
  }, [isVisible, isAnimating, createAnimation]);

  // Handle hover and click triggers
  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover' && !isAnimating) {
      createAnimation();
    }
  }, [trigger, isAnimating, createAnimation]);

  const handleClick = useCallback(() => {
    if (trigger === 'click' && !isAnimating) {
      createAnimation();
    }
  }, [trigger, isAnimating, createAnimation]);

  const containerClass = [
    'animated-container',
    `animation-${animation}`,
    isAnimating && 'animating',
    !shouldAnimate(config) && 'animation-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={elementRef}
      className={containerClass}
      style={style}
      onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
      onClick={trigger === 'click' ? handleClick : undefined}
    >
      {children}
    </div>
  );
};

// Scroll reveal component
interface ScrollRevealProps {
  children: ReactNode;
  animation?: keyof typeof ANIMATION_PRESETS;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  stagger?: number; // Delay between multiple elements
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = '',
  stagger = 0
}) => {
  return (
    <Animated
      animation={animation}
      trigger="scroll"
      config={{
        duration,
        delay: delay + stagger,
        enabledOnMobile: true,
        reducedMotionFallback: 'fade'
      }}
      scrollConfig={{
        threshold,
        triggerOnce: true
      }}
      className={className}
    >
      {children}
    </Animated>
  );
};

// Staggered animations for lists
interface StaggeredAnimationsProps {
  children: ReactNode[];
  animation?: keyof typeof ANIMATION_PRESETS;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

export const StaggeredAnimations: React.FC<StaggeredAnimationsProps> = ({
  children,
  animation = 'fadeInUp',
  staggerDelay = 100,
  duration = 600,
  className = ''
}) => {
  return (
    <div className={`staggered-container ${className}`}>
      {children.map((child, index) => (
        <ScrollReveal
          key={index}
          animation={animation}
          duration={duration}
          stagger={index * staggerDelay}
          threshold={0.1}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
};

// Loading animation component
interface LoadingAnimationProps {
  type?: 'spin' | 'pulse' | 'bounce' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spin',
  size = 'md',
  color = 'currentColor',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (type === 'dots') {
    return (
      <div className={`loading-dots ${className}`}>
        <div className="dot" style={{ backgroundColor: color }}></div>
        <div className="dot" style={{ backgroundColor: color }}></div>
        <div className="dot" style={{ backgroundColor: color }}></div>
      </div>
    );
  }

  return (
    <Animated
      animation={type}
      config={{
        duration: type === 'spin' ? 1000 : 600,
        iterations: 'infinite',
        enabledOnMobile: true,
        reducedMotionFallback: 'pulse'
      }}
      className={`loading-animation ${sizeClasses[size]} ${className}`}
    >
      <div 
        className="loading-element"
        style={{ 
          backgroundColor: color,
          borderRadius: type === 'bounce' ? '50%' : '4px'
        }}
      />
    </Animated>
  );
};

// Parallax scroll effect
interface ParallaxProps {
  children: ReactNode;
  speed?: number; // -1 to 1, where 0.5 means half speed
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  direction = 'vertical',
  className = ''
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const { prefersReducedMotion } = useResponsiveAnimation();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      
      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, prefersReducedMotion]);

  const transform = direction === 'vertical' 
    ? `translateY(${offset}px)` 
    : `translateX(${offset}px)`;

  return (
    <div 
      ref={elementRef}
      className={`parallax-container ${className}`}
      style={{
        transform: prefersReducedMotion ? 'none' : transform,
        transition: 'none'
      }}
    >
      {children}
    </div>
  );
};

export default {
  Animated,
  ScrollReveal,
  StaggeredAnimations,
  LoadingAnimation,
  Parallax,
  useResponsiveAnimation
};