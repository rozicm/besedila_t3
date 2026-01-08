// Band Manager Mobile App Color Theme
// Modern, cohesive color palette with Slovenian folk music aesthetic

export const Colors = {
  // Primary accent - warm amber/gold like folk instruments
  primary: '#D97706',
  primaryLight: '#F59E0B',
  primaryDark: '#B45309',
  
  // Secondary - deep forest green (Slovenian nature)
  secondary: '#059669',
  secondaryLight: '#10B981',
  secondaryDark: '#047857',
  
  // Feature colors (matching web app)
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  orange: '#F97316',
  red: '#EF4444',
  yellow: '#EAB308',
  
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#F9FAFB',
    backgroundSecondary: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    border: '#E5E7EB',
    tint: '#D97706',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#D97706',
    shadow: 'rgba(0, 0, 0, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    background: '#111827',
    backgroundSecondary: '#1F2937',
    card: '#1F2937',
    cardBorder: '#374151',
    border: '#374151',
    tint: '#F59E0B',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
};

export type ColorScheme = 'light' | 'dark';

export function getColors(scheme: ColorScheme) {
  return scheme === 'dark' ? Colors.dark : Colors.light;
}

export default Colors;
