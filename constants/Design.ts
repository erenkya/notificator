export const Colors = {
  primary: '#6366F1',
  background: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  accent: '#22C55E',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

export const Spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

export const Typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  header: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  secondary: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
};
