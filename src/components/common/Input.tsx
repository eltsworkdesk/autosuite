import React from 'react';
import { colors, spacing, radius, typography } from '../../design-system/tokens';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'range' | 'date';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, fullWidth = false, type = 'text', ...props }, ref) => {
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.sm,
      width: fullWidth ? '100%' : 'auto',
    };

    const labelStyles: React.CSSProperties = {
      fontFamily: typography.family.body,
      fontSize: '14px',
      fontWeight: typography.weight.semibold,
      color: colors.ink.primary,
    };

    const inputStyles: React.CSSProperties = {
      fontFamily: typography.family.body,
      fontSize: '14px',
      padding: `${spacing.md} ${spacing.lg}`,
      border: `1px solid ${error ? colors.danger[500] : colors.neutral[300]}`,
      borderRadius: radius.sm,
      color: colors.ink.primary,
      backgroundColor: colors.neutral[50],
      transition: `all 150ms ease-in-out`,
      width: fullWidth ? '100%' : 'auto',
    };

    const helperStyles: React.CSSProperties = {
      fontFamily: typography.family.body,
      fontSize: '12px',
      color: error ? colors.danger[500] : colors.ink.tertiary,
    };

    return (
      <div style={containerStyles}>
        {label && <label style={labelStyles}>{label}</label>}
        <input
          ref={ref}
          type={type}
          {...props}
          style={inputStyles}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary[500];
            e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? colors.danger[500] : colors.neutral[300];
            e.currentTarget.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
        />
        {(error || helper) && <span style={helperStyles}>{error || helper}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
