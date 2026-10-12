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
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        background: '#0b0614',
        foreground: '#f5f3ff',
        muted: '#a79fc0',
        accent: '#8b5cf6',
        accent2: '#a78bfa',
      },
    },
  },
  plugins: [heroui()],
} satisfies Config;
