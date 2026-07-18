import React from 'react';
import { colors, spacing, radius, transitions } from '../../design-system/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      fontFamily: 'inherit',
      fontWeight: 600,
      border: 'none',
      borderRadius: radius.button,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: transitions.fast,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      opacity: disabled || loading ? 0.6 : 1,
    };

    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        padding: `${spacing.sm} ${spacing.lg}`,
        fontSize: '12px',
      },
      md: {
        padding: `${spacing.md} ${spacing.xl}`,
        fontSize: '14px',
      },
      lg: {
        padding: `${spacing.lg} ${spacing.xl}`,
        fontSize: '15px',
      },
    };

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: colors.primary[500],
        color: '#ffffff',
      },
      secondary: {
        backgroundColor: colors.neutral[200],
        color: colors.ink.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.primary[500],
        border: `1px solid ${colors.primary[500]}`,
      },
      destructive: {
        backgroundColor: colors.danger[500],
        color: '#ffffff',
      },
    };

    const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: colors.primary[600],
      },
      secondary: {
        backgroundColor: colors.neutral[300],
      },
      ghost: {
        backgroundColor: colors.primary[50],
      },
      destructive: {
        backgroundColor: colors.danger[600],
      },
    };

    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <button
        ref={ref}
        {...props}
        disabled={disabled || loading}
        style={{
          ...baseStyles,
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...(isHovered && !disabled && !loading ? hoverStyles[variant] : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
