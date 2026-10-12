import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/theme';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#030711',
        foreground: '#f8fafc',
        muted: '#94a3b8',
        accent: '#7dd3fc',
        accent2: '#a78bfa',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(125,211,252,0.25), 0 20px 80px rgba(15,23,42,0.45)',
      },
    },
  },
  plugins: [heroui()],
} satisfies Config;
