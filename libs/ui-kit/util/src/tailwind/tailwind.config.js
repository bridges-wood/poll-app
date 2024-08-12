// libs/ui-kit/util/src/tailwind/tailwind.config.js

const { join } = require('path');

const defaultTheme = require('tailwindcss/defaultTheme');
const TailwindAnimate = require('tailwindcss-animate');

module.exports = {
  content: [
    // relative path by consumer app
    './{app,pages,components}/**/*.{js,jsx,ts,tsx}',
    // path to ui-kit components (relative to current dir)
    join(__dirname, '../../../ui/**/*.{js,jsx,ts,tsx}'),
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        foreground: {
          DEFAULT: 'var(--fgColor-default)',
          muted: 'var(--fgColor-muted)',
          emphasis: 'var(--fgColor-emphasis)',
          inverse: 'var(--fgColor-inverse)',
          white: 'var(--fgColor-white)',
          black: 'var(--fgColor-black)',
          disabled: 'var(--fgColor-disabled)',
          link: 'var(--fgColor-link)',
          neutral: 'var(--fgColor-neutral)',
          accent: 'var(--fgColor-accent)',
          success: 'var(--fgColor-success)',
          open: 'var(--fgColor-open)',
          attention: 'var(--fgColor-attention)',
          severe: 'var(--fgColor-severe)',
          danger: 'var(--fgColor-danger)',
          closed: 'var(--fgColor-closed)',
          done: 'var(--fgColor-done)',
          upsell: 'var(--fgColor-upsell)',
        },
        background: {
          DEFAULT: 'var(--bgColor-default)',
          muted: 'var(--bgColor-muted)',
          inset: 'var(--bgColor-inset)',
          emphasis: 'var(--bgColor-emphasis)',
          inverse: 'var(--bgColor-inverse)',
          white: 'var(--bgColor-white)',
          black: 'var(--bgColor-black)',
          disabled: 'var(--bgColor-disabled)',
          transparent: 'var(--bgColor-transparent)',
          "neutral-muted": 'var(--bgColor-neutral-muted)',
          "neutral-emphasis": 'var(--bgColor-neutral-emphasis)',
          "accent-muted": 'var(--bgColor-accent-muted)',
          "accent-emphasis": 'var(--bgColor-accent-emphasis)',
          "success-muted": 'var(--bgColor-success-muted)',
          "success-emphasis": 'var(--bgColor-success-emphasis)',
          "open-muted": 'var(--bgColor-open-muted)',
          "open-emphasis": 'var(--bgColor-open-emphasis)',
          "attention-muted": 'var(--bgColor-attention-muted)',
          "attention-emphasis": 'var(--bgColor-attention-emphasis)',
          "severe-muted": 'var(--bgColor-severe-muted)',
          "severe-emphasis": 'var(--bgColor-severe-emphasis)',
          "danger-muted": 'var(--bgColor-danger-muted)',
          "danger-emphasis": 'var(--bgColor-danger-emphasis)',
          "closed-muted": 'var(--bgColor-closed-muted)',
          "closed-emphasis": 'var(--bgColor-closed-emphasis)',
          "done-muted": 'var(--bgColor-done-muted)',
          "done-emphasis": 'var(--bgColor-done-emphasis)',
          "upsell-muted": 'var(--bgColor-upsell-muted)',
          "upsell-emphasis": 'var(--bgColor-upsell-emphasis)',
          "sponsors-muted": 'var(--bgColor-sponsors-muted)',
          "sponsors-emphasis": 'var(--bgColor-sponsors-emphasis)',
        },
        border: {
          DEFAULT: 'var(--default-border)',
          muted: 'var(--muted-border)',
          emphasis: 'var(--emphasis-border)',
          disabled: 'var(--disabled-border)',
          transparent: 'var(--transparent-border)',
          translucent: 'var(--translucent-border)',
          "neutral-muted": 'var(--neutral-muted-border)',
          "neutral-emphasis": 'var(--neutral-emphasis-border)',
          "accent-muted": 'var(--accent-muted-border)',
          "accent-emphasis": 'var(--accent-emphasis-border)',
          "success-muted": 'var(--success-muted-border)',
          "success-emphasis": 'var(--success-emphasis-border)',
          "open-muted": 'var(--open-muted-border)',
          "open-emphasis": 'var(--open-emphasis-border)',
          "attention-muted": 'var(--attention-muted-border)',
          "attention-emphasis": 'var(--attention-emphasis-border)',
          "severe-muted": 'var(--severe-muted-border)',
          "severe-emphasis": 'var(--severe-emphasis-border)',
          "danger-muted": 'var(--danger-muted-border)',
          "danger-emphasis": 'var(--danger-emphasis-border)',
          "closed-muted": 'var(--closed-muted-border)',
          "closed-emphasis": 'var(--closed-emphasis-border)',
          "done-muted": 'var(--done-muted-border)',
          "done-emphasis": 'var(--done-emphasis-border)',
          "upsell-muted": 'var(--upsell-muted-border)',
          "upsell-emphasis": 'var(--upsell-emphasis-border)',
          "sponsors-muted": 'var(--sponsors-muted-border)',
          "sponsors-emphasis": 'var(--sponsors-emphasis-border)',
        }
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius-default)',
        sm: 'var(--border-radius-sm)',
        md: 'var(--border-radius-md)',
        lg: 'var(--border-radius-lg)',
        xl: 'var(--border-radius-xl)',
        full: 'var(--border-radius-full)',
      },
      borderWidth: {
        thin: 'var(--border-width-thin)',
        thick: 'var(--border-width-thick)',
        thicker: 'var(--border-width-thicker)',
      },
      boxShadow: {
        "inset": 'var(--inset-shadow)',
        "resting-xs": 'var(--resting-xsmall-shadow)',
        "resting-sm": 'var(--resting-small-shadow)',
        "resting-md": 'var(--resting-medium-shadow)',
        "floating-sm": 'var(--floating-small-shadow)',
        "floating-md": 'var(--floating-medium-shadow)',
        "floating-lg": 'var(--floating-large-shadow)',
        "floating-xl": 'var(--floating-xlarge-shadow)',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        'slide-down': {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
      },
    },
  },
  plugins: [TailwindAnimate],
  darkMode: ['class'],
};