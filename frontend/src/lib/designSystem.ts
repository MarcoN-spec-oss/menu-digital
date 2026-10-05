// Design System Tokens - Warm Minimal for Restaurant Menu App
// Based on ui-ux-pro-max + frontend-design methodologies

export const colors = {
  // Primary - Warm amber/orange for food appetite appeal
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Main brand color
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  // Neutral - Warm grays for better food photography contrast
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },

  // Success - Green for confirmations
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  // Warning - Amber for pending states
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },

  // Danger - Red for errors/destructive
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Semantic aliases for easy theming
  semantic: {
    bg: {
      primary: 'var(--color-bg-primary)',
      secondary: 'var(--color-bg-secondary)',
      tertiary: 'var(--color-bg-tertiary)',
      inverse: 'var(--color-bg-inverse)',
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      tertiary: 'var(--color-text-tertiary)',
      inverse: 'var(--color-text-inverse)',
      link: 'var(--color-text-link)',
    },
    border: {
      light: 'var(--color-border-light)',
      default: 'var(--color-border-default)',
      strong: 'var(--color-border-strong)',
      focus: 'var(--color-border-focus)',
    },
    status: {
      success: 'var(--color-status-success)',
      warning: 'var(--color-status-warning)',
      danger: 'var(--color-status-danger)',
      info: 'var(--color-status-info)',
    },
  },
} as const;

export const typography = {
  fontFamilies: {
    sans: "'Inter', 'Noto Sans', system-ui, -apple-system, sans-serif",
    display: "'Playfair Display', 'Georgia', serif", // Elegant for headings
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.1,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  focus: '0 0 0 3px rgb(249 115 22 / 0.4)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  toast: 1400,
  tooltip: 1500,
} as const;

// CSS Custom Properties Generator
export function generateCSSVariables(): string {
  return `
:root {
  /* Colors - Primary */
  --color-primary-50: ${colors.primary[50]};
  --color-primary-100: ${colors.primary[100]};
  --color-primary-200: ${colors.primary[200]};
  --color-primary-300: ${colors.primary[300]};
  --color-primary-400: ${colors.primary[400]};
  --color-primary-500: ${colors.primary[500]};
  --color-primary-600: ${colors.primary[600]};
  --color-primary-700: ${colors.primary[700]};
  --color-primary-800: ${colors.primary[800]};
  --color-primary-900: ${colors.primary[900]};
  --color-primary-950: ${colors.primary[950]};

  /* Colors - Neutral */
  --color-neutral-50: ${colors.neutral[50]};
  --color-neutral-100: ${colors.neutral[100]};
  --color-neutral-200: ${colors.neutral[200]};
  --color-neutral-300: ${colors.neutral[300]};
  --color-neutral-400: ${colors.neutral[400]};
  --color-neutral-500: ${colors.neutral[500]};
  --color-neutral-600: ${colors.neutral[600]};
  --color-neutral-700: ${colors.neutral[700]};
  --color-neutral-800: ${colors.neutral[800]};
  --color-neutral-900: ${colors.neutral[900]};
  --color-neutral-950: ${colors.neutral[950]};

  /* Colors - Status */
  --color-success-50: ${colors.success[50]};
  --color-success-100: ${colors.success[100]};
  --color-success-500: ${colors.success[500]};
  --color-success-600: ${colors.success[600]};
  --color-success-700: ${colors.success[700]};

  --color-warning-50: ${colors.warning[50]};
  --color-warning-100: ${colors.warning[100]};
  --color-warning-500: ${colors.warning[500]};
  --color-warning-600: ${colors.warning[600]};

  --color-danger-50: ${colors.danger[50]};
  --color-danger-100: ${colors.danger[100]};
  --color-danger-500: ${colors.danger[500]};
  --color-danger-600: ${colors.danger[600]};
  --color-danger-700: ${colors.danger[700]};

  /* Semantic Colors */
  --color-bg-primary: ${colors.neutral[50]};
  --color-bg-secondary: ${colors.neutral[100]};
  --color-bg-tertiary: ${colors.neutral[200]};
  --color-bg-inverse: ${colors.neutral[900]};

  --color-text-primary: ${colors.neutral[900]};
  --color-text-secondary: ${colors.neutral[600]};
  --color-text-tertiary: ${colors.neutral[400]};
  --color-text-inverse: ${colors.neutral[50]};
  --color-text-link: ${colors.primary[600]};

  --color-border-light: ${colors.neutral[200]};
  --color-border-default: ${colors.neutral[300]};
  --color-border-strong: ${colors.neutral[400]};
  --color-border-focus: ${colors.primary[500]};

  --color-status-success: ${colors.success[600]};
  --color-status-warning: ${colors.warning[600]};
  --color-status-danger: ${colors.danger[600]};
  --color-status-info: ${colors.primary[600]};

  /* Typography */
  --font-sans: ${typography.fontFamilies.sans};
  --font-display: ${typography.fontFamilies.display};
  --font-mono: ${typography.fontFamilies.mono};

  --text-xs: ${typography.fontSizes.xs};
  --text-sm: ${typography.fontSizes.sm};
  --text-base: ${typography.fontSizes.base};
  --text-lg: ${typography.fontSizes.lg};
  --text-xl: ${typography.fontSizes.xl};
  --text-2xl: ${typography.fontSizes['2xl']};
  --text-3xl: ${typography.fontSizes['3xl']};
  --text-4xl: ${typography.fontSizes['4xl']};
  --text-5xl: ${typography.fontSizes['5xl']};

  --font-light: ${typography.fontWeights.light};
  --font-normal: ${typography.fontWeights.normal};
  --font-medium: ${typography.fontWeights.medium};
  --font-semibold: ${typography.fontWeights.semibold};
  --font-bold: ${typography.fontWeights.bold};

  --leading-tight: ${typography.lineHeights.tight};
  --leading-snug: ${typography.lineHeights.snug};
  --leading-normal: ${typography.lineHeights.normal};
  --leading-relaxed: ${typography.lineHeights.relaxed};

  --tracking-tight: ${typography.letterSpacing.tight};
  --tracking-normal: ${typography.letterSpacing.normal};
  --tracking-wide: ${typography.letterSpacing.wide};

  /* Spacing */
  --space-0: ${spacing[0]};
  --space-1: ${spacing[1]};
  --space-2: ${spacing[2]};
  --space-3: ${spacing[3]};
  --space-4: ${spacing[4]};
  --space-5: ${spacing[5]};
  --space-6: ${spacing[6]};
  --space-8: ${spacing[8]};
  --space-10: ${spacing[10]};
  --space-12: ${spacing[12]};
  --space-16: ${spacing[16]};
  --space-20: ${spacing[20]};
  --space-24: ${spacing[24]};

  /* Border Radius */
  --radius-none: ${borderRadius.none};
  --radius-sm: ${borderRadius.sm};
  --radius: ${borderRadius.DEFAULT};
  --radius-md: ${borderRadius.md};
  --radius-lg: ${borderRadius.lg};
  --radius-xl: ${borderRadius.xl};
  --radius-2xl: ${borderRadius['2xl']};
  --radius-full: ${borderRadius.full};

  /* Shadows */
  --shadow-xs: ${shadows.xs};
  --shadow-sm: ${shadows.sm};
  --shadow: ${shadows.DEFAULT};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-xl: ${shadows.xl};
  --shadow-inner: ${shadows.inner};
  --shadow-focus: ${shadows.focus};

  /* Transitions */
  --transition-fast: ${transitions.fast};
  --transition: ${transitions.DEFAULT};
  --transition-slow: ${transitions.slow};

  /* Z-Index */
  --z-hide: ${zIndex.hide};
  --z-base: ${zIndex.base};
  --z-dropdown: ${zIndex.dropdown};
  --z-sticky: ${zIndex.sticky};
  --z-modal: ${zIndex.modal};
  --z-popover: ${zIndex.popover};
  --z-toast: ${zIndex.toast};
  --z-tooltip: ${zIndex.tooltip};
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: ${colors.neutral[950]};
    --color-bg-secondary: ${colors.neutral[900]};
    --color-bg-tertiary: ${colors.neutral[800]};
    --color-bg-inverse: ${colors.neutral[50]};

    --color-text-primary: ${colors.neutral[50]};
    --color-text-secondary: ${colors.neutral[400]};
    --color-text-tertiary: ${colors.neutral[500]};
    --color-text-inverse: ${colors.neutral[900]};
    --color-text-link: ${colors.primary[400]};

    --color-border-light: ${colors.neutral[800]};
    --color-border-default: ${colors.neutral[700]};
    --color-border-strong: ${colors.neutral[600]};
  }
}
`;
}

// Component variant types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type InputSize = 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
export type BadgeSize = 'xs' | 'sm' | 'md';