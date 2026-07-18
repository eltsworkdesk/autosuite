import React from 'react';
import { colors, spacing, radius, shadows } from '../../design-system/tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: '#ffffff',
        border: 'none',
        boxShadow: shadows.sm,
      },
      elevated: {
        backgroundColor: '#ffffff',
        border: 'none',
        boxShadow: shadows.lg,
      },
      outlined: {
        backgroundColor: colors.neutral[50],
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: 'none',
      },
    };

    const baseStyles: React.CSSProperties = {
      borderRadius: radius.md,
      padding: spacing.lg,
      transition: 'all 250ms ease-in-out',
    };

    return (
      <div
        ref={ref}
        {...props}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...props.style,
        }}
      >
        {props.children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
