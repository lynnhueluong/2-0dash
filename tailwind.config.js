// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Career Translator Brand Colors */
        'ct-primary': '#3d6aff',
        'ct-success': '#e0fff1',
        'ct-warning': '#ff5010',
        'ct-bg-neutral': '#f7faff',
        'ct-bg-elevated': '#fbfff5',
        'ct-text-primary': '#0b101f',
        'ct-text-secondary': '#727c9d',
        'ct-border': '#e0e7ff',
      },
      fontFamily: {
        sans: ['Inter Tight', 'sans-serif'],
        railroad: ['Railroad Gothic CC', 'Inter Tight', 'sans-serif'],
      },
      borderRadius: {
        'ct-xs': '3px',
        'ct-sm': '7px',
        'ct-md': '10px',
        'ct-lg': '15px',
        'ct-xl': '20px',
        'ct-full': '100px',
      },
      spacing: {
        'ct-xs': '8px',
        'ct-sm': '16px',
        'ct-md': '24px',
        'ct-lg': '40px',
        'ct-xl': '64px',
        'ct-2xl': '96px',
      },
      boxShadow: {
        'ct-pill-sm': 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)',
        'ct-pill-md': 'inset 0 -3px 6px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(61, 92, 255, 0.2)',
        'ct-glow-primary': '0 0 20px rgba(61, 92, 255, 0.6), 0 0 40px rgba(61, 92, 255, 0.3)',
        'ct-glow-success': '0 0 20px rgba(224, 255, 241, 0.6), 0 0 40px rgba(224, 255, 241, 0.3)',
      },
      letterSpacing: {
        'ct-tight': '-0.04em',
        'ct-normal': '-0.02em',
        'ct-body': '-0.01em',
      },
      backgroundImage: {
        'ct-gradient': 'linear-gradient(135deg, #3d6aff 0%, #e0fff1 100%)',
      },
    },
  },
  plugins: [],
};
