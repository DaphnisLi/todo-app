import { CategoryColor } from '../types';

export const CATEGORY_COLORS: CategoryColor[] = [
  'red',
  'orange', 
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'gray',
  'black',
];

export const COLOR_DISPLAY = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  gray: '#6b7280',
  black: '#000000',
} as const;

export function getCategoryColor(color: CategoryColor): string {
  return COLOR_DISPLAY[color];
}
