"use client";

// Responsive Grid System Component
// Based on CLAUDE.md Part 1 - Safe responsive grid implementation

import React, { forwardRef, CSSProperties, ReactNode } from 'react';

// Grid Container Props
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fluid?: boolean;
  style?: CSSProperties;
}

// Grid Row Props
interface ResponsiveRowProps {
  children: ReactNode;
  className?: string;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  style?: CSSProperties;
}

// Grid Column Props
interface ResponsiveColProps {
  children: ReactNode;
  className?: string;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  offset?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  order?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  style?: CSSProperties;
}

// Auto Grid Props (CSS Grid based)
interface ResponsiveAutoGridProps {
  children: ReactNode;
  className?: string;
  minItemWidth?: string;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  columns?: number | 'auto';
  rows?: number | 'auto';
  areas?: string[];
  dense?: boolean;
  style?: CSSProperties;
}

// Masonry Grid Props
interface ResponsiveMasonryProps {
  children: ReactNode;
  className?: string;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  style?: CSSProperties;
}

// Container Component
export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ children, className = '', maxWidth = 'lg', padding = 'md', fluid = false, style }, ref) => {
    const containerClasses = [
      'responsive-container',
      !fluid && `container-${maxWidth}`,
      fluid && 'container-fluid',
      `padding-${padding}`,
      className
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClasses} style={style}>
        {children}
      </div>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

// Row Component
export const ResponsiveRow = forwardRef<HTMLDivElement, ResponsiveRowProps>(
  ({ 
    children, 
    className = '', 
    gap = 'md', 
    align = 'stretch',
    justify = 'start',
    wrap = true,
    direction = 'row',
    style 
  }, ref) => {
    const rowClasses = [
      'responsive-row',
      `gap-${gap}`,
      `align-${align}`,
      `justify-${justify}`,
      wrap ? 'flex-wrap' : 'flex-nowrap',
      `flex-${direction}`,
      className
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={rowClasses} style={style}>
        {children}
      </div>
    );
  }
);

ResponsiveRow.displayName = 'ResponsiveRow';

// Column Component
export const ResponsiveCol = forwardRef<HTMLDivElement, ResponsiveColProps>(
  ({ children, className = '', xs, sm, md, lg, xl, offset, order, style }, ref) => {
    const colClasses = ['responsive-col'];
    
    // Add size classes
    if (xs) colClasses.push(`col-xs-${xs}`);
    if (sm) colClasses.push(`col-sm-${sm}`);
    if (md) colClasses.push(`col-md-${md}`);
    if (lg) colClasses.push(`col-lg-${lg}`);
    if (xl) colClasses.push(`col-xl-${xl}`);
    
    // Add offset classes
    if (offset) {
      if (offset.xs) colClasses.push(`offset-xs-${offset.xs}`);
      if (offset.sm) colClasses.push(`offset-sm-${offset.sm}`);
      if (offset.md) colClasses.push(`offset-md-${offset.md}`);
      if (offset.lg) colClasses.push(`offset-lg-${offset.lg}`);
      if (offset.xl) colClasses.push(`offset-xl-${offset.xl}`);
    }
    
    // Add order classes
    if (order) {
      if (order.xs) colClasses.push(`order-xs-${order.xs}`);
      if (order.sm) colClasses.push(`order-sm-${order.sm}`);
      if (order.md) colClasses.push(`order-md-${order.md}`);
      if (order.lg) colClasses.push(`order-lg-${order.lg}`);
      if (order.xl) colClasses.push(`order-xl-${order.xl}`);
    }
    
    colClasses.push(className);
    
    return (
      <div ref={ref} className={colClasses.join(' ')} style={style}>
        {children}
      </div>
    );
  }
);

ResponsiveCol.displayName = 'ResponsiveCol';

// Auto Grid Component (CSS Grid)
export const ResponsiveAutoGrid = forwardRef<HTMLDivElement, ResponsiveAutoGridProps>(
  ({ 
    children, 
    className = '', 
    minItemWidth = '250px', 
    gap = 'md',
    columns = 'auto',
    rows = 'auto',
    areas,
    dense = false,
    style 
  }, ref) => {
    const autoGridClasses = [
      'responsive-auto-grid',
      `gap-${gap}`,
      dense && 'grid-dense',
      className
    ].filter(Boolean).join(' ');

    const gridStyle: CSSProperties = {
      ...style,
      gridTemplateColumns: columns === 'auto' 
        ? `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
        : `repeat(${columns}, 1fr)`,
      gridTemplateRows: rows === 'auto' ? undefined : `repeat(${rows}, 1fr)`,
      gridTemplateAreas: areas ? areas.map(area => `"${area}"`).join(' ') : undefined
    };

    return (
      <div ref={ref} className={autoGridClasses} style={gridStyle}>
        {children}
      </div>
    );
  }
);

ResponsiveAutoGrid.displayName = 'ResponsiveAutoGrid';

// Masonry Grid Component
export const ResponsiveMasonry = forwardRef<HTMLDivElement, ResponsiveMasonryProps>(
  ({ children, className = '', columns = { xs: 1, sm: 2, md: 3, lg: 4 }, gap = 'md', style }, ref) => {
    const masonryClasses = [
      'responsive-masonry',
      `gap-${gap}`,
      `masonry-xs-${columns.xs || 1}`,
      `masonry-sm-${columns.sm || 2}`,
      `masonry-md-${columns.md || 3}`,
      `masonry-lg-${columns.lg || 4}`,
      `masonry-xl-${columns.xl || 4}`,
      className
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={masonryClasses} style={style}>
        {children}
      </div>
    );
  }
);

ResponsiveMasonry.displayName = 'ResponsiveMasonry';

// Grid Item Component (for CSS Grid areas)
interface ResponsiveGridItemProps {
  children: ReactNode;
  className?: string;
  area?: string;
  column?: string;
  row?: string;
  style?: CSSProperties;
}

export const ResponsiveGridItem = forwardRef<HTMLDivElement, ResponsiveGridItemProps>(
  ({ children, className = '', area, column, row, style }, ref) => {
    const itemStyle: CSSProperties = {
      ...style,
      gridArea: area,
      gridColumn: column,
      gridRow: row
    };

    return (
      <div ref={ref} className={`responsive-grid-item ${className}`} style={itemStyle}>
        {children}
      </div>
    );
  }
);

ResponsiveGridItem.displayName = 'ResponsiveGridItem';

// Hook for responsive breakpoints
export function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 576) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 992) setBreakpoint('md');
      else if (width < 1200) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

// Hook for grid utilities
export function useGridUtils() {
  const breakpoint = useResponsiveBreakpoint();
  
  const getResponsiveValue = <T>(values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
  }, fallback: T): T => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = breakpoints.indexOf(breakpoint);
    
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpoints[i] as keyof typeof values;
      if (values[bp] !== undefined) {
        return values[bp] as T;
      }
    }
    
    return fallback;
  };

  const isBreakpoint = (bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => breakpoint === bp;
  const isBreakpointUp = (bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
    return breakpoints.indexOf(breakpoint) >= breakpoints.indexOf(bp);
  };
  const isBreakpointDown = (bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
    return breakpoints.indexOf(breakpoint) <= breakpoints.indexOf(bp);
  };

  return {
    breakpoint,
    getResponsiveValue,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown
  };
}

// Example usage components
export const GridExamples = () => {
  return (
    <div className="grid-examples-showcase">
      <ResponsiveContainer maxWidth="xl">
        <h2>Responsive Grid Examples</h2>
        
        {/* Basic Flexbox Grid */}
        <section>
          <h3>Flexbox Grid System</h3>
          <ResponsiveRow gap="md">
            <ResponsiveCol xs={12} md={4}>
              <div className="demo-box">Column 1</div>
            </ResponsiveCol>
            <ResponsiveCol xs={12} md={4}>
              <div className="demo-box">Column 2</div>
            </ResponsiveCol>
            <ResponsiveCol xs={12} md={4}>
              <div className="demo-box">Column 3</div>
            </ResponsiveCol>
          </ResponsiveRow>
        </section>

        {/* Auto Grid */}
        <section>
          <h3>Auto-Fit CSS Grid</h3>
          <ResponsiveAutoGrid minItemWidth="200px" gap="md">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="demo-box">
                Auto Item {i + 1}
              </div>
            ))}
          </ResponsiveAutoGrid>
        </section>

        {/* Masonry Layout */}
        <section>
          <h3>Masonry Layout</h3>
          <ResponsiveMasonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="md">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="demo-box" style={{ 
                height: `${100 + (i % 3) * 50}px` 
              }}>
                Masonry Item {i + 1}
              </div>
            ))}
          </ResponsiveMasonry>
        </section>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponsiveGrid;