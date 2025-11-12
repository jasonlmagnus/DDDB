// Theme configuration and reusable style values
export const theme = {
  colors: {
    primary: {
      dark: '#0f172a', // slate-900
      light: '#f1f5f9', // slate-100
      text: '#1e293b', // slate-800
    },
    fear: {
      bg: '#fef2f2', // red-50
      border: '#fecaca', // red-200
      text: '#991b1b', // red-800
      icon: '#dc2626', // red-600
    },
    value: {
      bg: '#eff6ff', // blue-50
      border: '#bfdbfe', // blue-200
      text: '#1e40af', // blue-700
      icon: '#2563eb', // blue-600
    },
    reality: {
      bg: '#f0fdf4', // green-50
      border: '#bbf7d0', // green-200
      text: '#166534', // green-700
      icon: '#16a34a', // green-600
    },
    info: {
      bg: '#eff6ff', // blue-50
      border: '#3b82f6', // blue-500
    },
  },
  spacing: {
    container: 'max-w-5xl',
    section: 'p-8',
    card: 'p-6',
  },
  typography: {
    heading: {
      main: 'text-5xl font-bold',
      section: 'text-3xl font-bold',
      subsection: 'text-xl font-bold',
    },
  },
  effects: {
    shadow: {
      sm: 'shadow-sm',
      md: 'shadow-lg',
    },
    gradient: {
      background: 'bg-gradient-to-br from-slate-50 to-slate-100',
    },
  },
};

