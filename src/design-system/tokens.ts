/**
 * AutoSuite Design Tokens
 * Centralized design system values (colors, typography, spacing, shadows, radius)
 * Maps directly from UX spec to code
 */

export const colors = {
  // Primary
  primary: {
    50: '#f0f3ff',
    100: '#e6ebff',
    200: '#bcc8ff',
    300: '#92a3ff',
    400: '#6879ff',
    500: '#4A5FFF', // oklch(45% 0.16 260)
    600: '#3d4acc',
    700: '#2e3799',
    800: '#232a66',
    900: '#181d33',
  },

  // Accent (Orange)
  accent: {
    50: '#fffbf0',
    100: '#fff5dd',
    200: '#ffe5b3',
    300: '#ffd699',
    400: '#ffb700', // oklch(65% 0.14 55)
    500: '#e6a500',
    600: '#cc9500',
    700: '#b38400',
    800: '#997000',
    900: '#664b00',
  },

  // Success (Green)
  success: {
    50: '#f0fef7',
    100: '#d4fde4',
    200: '#a8fcc6',
    300: '#59f7a6',
    400: '#00A876', // oklch(60% 0.14 145)
    500: '#009266',
    600: '#007a52',
    700: '#00623d',
    800: '#004a2e',
    900: '#00321e',
  },

  // Danger (Red)
  danger: {
    50: '#fef2f0',
    100: '#fde1dd',
    200: '#fbc5bb',
    300: '#f8a39a',
    400: '#E63946', // oklch(55% 0.18 25)
    500: '#d62828',
    600: '#b8221f',
    700: '#951c17',
    800: '#71160f',
    900: '#4d0f0a',
  },

  // Ink (Dark text)
  ink: {
    primary: '#0B1220', // oklch(20% 0.012 260) - near-black
    secondary: '#3d4a6c',
    tertiary: '#5f6b8d',
  },

  // Neutral Grays (oklch scale)
  neutral: {
    50: '#fafbfc',
    100: '#f3f5f7',
    200: '#e8ecf1',
    300: '#d9dfe8',
    400: '#c7cdd8',
    500: '#aab3c4',
    600: '#8896aa',
    700: '#5f6b7f',
    800: '#3d4552',
    900: '#1a1e27',
  },

  // Semantic states
  state: {
    hover: 'rgba(0, 0, 0, 0.04)',
    focus: 'rgba(74, 95, 255, 0.1)',
    active: 'rgba(74, 95, 255, 0.16)',
    disabled: 'rgba(0, 0, 0, 0.08)',
    invalid: '#E63946',
  },
};

export const typography = {
  family: {
    display: "'Space Grotesk', sans-serif",
    body: "'IBM Plex Sans', sans-serif",
    mono: "'IBM Plex Mono', monospace",
  },

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  scale: {
    xs: '11px',
    sm: '12px',
    base: '14px', // Default body
    md: '15px',
    lg: '18px',
    xl: '20px',
    '2xl': '28px',
    '3xl': '32px',
    '4xl': '34px',
    '5xl': '56px',
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Preset combinations
  presets: {
    h1: {
      family: "'Space Grotesk', sans-serif",
      size: '56px',
      weight: 700,
      lineHeight: 1.2,
    },
    h2: {
      family: "'Space Grotesk', sans-serif",
      size: '34px',
      weight: 700,
      lineHeight: 1.2,
    },
    h3: {
      family: "'Space Grotesk', sans-serif",
      size: '32px',
      weight: 700,
      lineHeight: 1.2,
    },
    h4: {
      family: "'Space Grotesk', sans-serif",
      size: '28px',
      weight: 600,
      lineHeight: 1.3,
    },
    h5: {
      family: "'Space Grotesk', sans-serif",
      size: '20px',
      weight: 600,
      lineHeight: 1.4,
    },
    h6: {
      family: "'Space Grotesk', sans-serif",
      size: '18px',
      weight: 600,
      lineHeight: 1.4,
    },
    bodyLarge: {
      family: "'IBM Plex Sans', sans-serif",
      size: '15px',
      weight: 400,
      lineHeight: 1.5,
    },
    body: {
      family: "'IBM Plex Sans', sans-serif",
      size: '14px',
      weight: 400,
      lineHeight: 1.5,
    },
    bodySmall: {
      family: "'IBM Plex Sans', sans-serif",
      size: '12px',
      weight: 400,
      lineHeight: 1.5,
    },
    labelLarge: {
      family: "'IBM Plex Sans', sans-serif",
      size: '14px',
      weight: 600,
      lineHeight: 1.5,
    },
    label: {
      family: "'IBM Plex Sans', sans-serif",
      size: '12px',
      weight: 600,
      lineHeight: 1.5,
    },
    mono: {
      family: "'IBM Plex Mono', monospace",
      size: '12px',
      weight: 400,
      lineHeight: 1.5,
    },
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
  '7xl': '80px',
};

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  button: '9px',
  pill: '999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
  md: '0 4px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 20px -8px rgba(0, 0, 0, 0.15)',
  xl: '0 20px 40px -12px rgba(0, 0, 0, 0.2)',
};

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  overlay: 400,
  modal: 500,
  toast: 600,
  tooltip: 700,
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '250ms ease-in-out',
  slow: '350ms ease-in-out',
};

export const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1280px',
};
