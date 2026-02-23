/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#08080c',
          1: '#0c0c14',
          2: '#12121e',
          3: '#1a1a2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'meteor': 'meteor 5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        meteor: {
          '0%': { transform: 'rotate(135deg) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(135deg) translateX(1000px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '50%': { transform: 'translateY(100%)', opacity: '0.5' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
