/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#c1d3fe',
          300: '#91b1fd',
          400: '#5c8afb',
          500: '#3761f4',
          600: '#2543e8',
          700: '#1d32d4',
          800: '#1e2ab2',
          900: '#003893', // Official Navy Blue
          950: '#001b5d',
        },
        accent: {
          crimson: '#DC143C', // Official Crimson
          emerald: '#10b981',
          amber: '#f59e0b',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'xs': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'sm': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'base': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        'xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
        '4xl': ['3rem', { lineHeight: '1' }],            // 48px
        '5xl': ['3.75rem', { lineHeight: '1' }],         // 60px
        '6xl': ['4.5rem', { lineHeight: '1' }],          // 72px
        '7xl': ['6rem', { lineHeight: '1' }],            // 96px
        '8xl': ['8rem', { lineHeight: '1' }],            // 128px
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #003893 0%, #001b5d 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      }
    },
  },
  plugins: [],
}
