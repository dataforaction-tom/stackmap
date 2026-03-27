import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f7f3',
          100: '#dfeee2',
          200: '#bfddc6',
          300: '#93c4a0',
          400: '#63a576',
          500: '#3f8856',
          600: '#2e6d42',
          700: '#265837',
          800: '#21472e',
          900: '#1c3b27',
          950: '#0e2116',
        },
        accent: {
          50: '#fef5ee',
          100: '#fce8d6',
          200: '#f9cead',
          300: '#f4a878',
          400: '#ee7a42',
          500: '#ea5f22',
          600: '#db4617',
          700: '#b63315',
          800: '#912a19',
          900: '#752518',
          950: '#3f100a',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe3',
          200: '#d2d8c8',
          300: '#b3bea4',
          400: '#95a382',
          500: '#788866',
          600: '#5e6c4f',
          700: '#4a5540',
          800: '#3d4536',
          900: '#343b2f',
        },
        surface: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#ece6db',
          300: '#dfd6c8',
          400: '#c8baa6',
        },
      },
      fontFamily: {
        display: ['Source Serif 4', 'Georgia', 'serif'],
        body: ['Figtree', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.08', fontWeight: '800' }],
        'display-lg': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15', fontWeight: '700' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.7' }],
      },
    },
  },
  plugins: [],
};

export default config;
