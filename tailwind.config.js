// Tailwind CSS configuration file with design tokens and theme extensions
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rawaa: {
          primary: '#C25E3E',
          'primary-hover': '#A94F32',
          'primary-active': '#8F3F25',
          'primary-light': '#FDF3EF',
          'primary-tint': 'rgba(194, 94, 62, 0.08)',
          sage: '#2D5A46',
          'sage-hover': '#224535',
          'sage-light': '#EDF4F0',
          'sage-tint': 'rgba(45, 90, 70, 0.08)',
          amber: '#D97706',
          'amber-light': '#FEF3C7',
          gold: '#EAB308',
          bg: '#FAF7F2',
          card: '#FFFFFF',
          soft: '#F4EFEB',
          hover: '#F8F4EE',
          dark: '#19211D',
          muted: '#586560',
          subtle: '#84918B',
          border: '#E8E2D8',
          'border-hover': '#D5CCC0',
        }
      },
      fontFamily: {
        heading: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        body: ['Readex Pro', 'Tajawal', 'system-ui', 'sans-serif'],
        tajawal: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        'panel': '22px',
        'arch': '180px 180px 30px 30px',
      },
      boxShadow: {
        'soft-xs': '0 1px 3px rgba(25, 33, 29, 0.04)',
        'soft-sm': '0 2px 8px rgba(25, 33, 29, 0.06)',
        'soft-md': '0 6px 20px rgba(25, 33, 29, 0.08), 0 2px 4px rgba(25, 33, 29, 0.04)',
        'soft-lg': '0 14px 34px rgba(25, 33, 29, 0.10), 0 4px 10px rgba(25, 33, 29, 0.05)',
        'soft-xl': '0 24px 50px rgba(25, 33, 29, 0.14), 0 8px 20px rgba(25, 33, 29, 0.06)',
      }
    },
  },
  plugins: [],
};
