import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        accent: {
          light: '#60A5FA',
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        content: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          tertiary: 'rgba(255, 255, 255, 0.5)',
        },
        stats: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          indigo: '#6366F1',
          cyan: '#0EA5E9',
          sky: '#0284C7',
        },
      },
      boxShadow: {
        'stats': '0 0 20px rgba(59, 130, 246, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config; 