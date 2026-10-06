/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand – keep CSS vars as source of truth so pages that use var() still work
        primary: 'var(--ui-primary)',
        'primary-hover': 'var(--ui-primary-hover)',
        'primary-soft': 'var(--ui-soft)',
        accent: 'var(--ui-accent)',
        canvas: 'var(--ui-bg)',
        surface: 'var(--ui-surface)',
        ink: 'var(--ui-ink)',
        muted: 'var(--ui-muted)',
        border: 'var(--ui-border)',
        danger: 'var(--ui-danger)',
        success: 'var(--ui-success)',
        warning: 'var(--ui-warning)',
        nav: 'var(--ui-nav)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--ui-radius)',
        sm: '4px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.04)',
        elevated: '0 4px 20px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 3px rgba(23, 102, 91, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        shimmer: 'shimmer 1.4s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
