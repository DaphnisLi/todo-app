import { Priority, CategoryColor } from '../types';

export const PRIORITIES: Record<Priority, { label: string; color: string; order: number }> = {
  'urgent-important': { label: '紧急重要', color: '#ef4444', order: 1 },
  'important-not-urgent': { label: '重要不紧急', color: '#f59e0b', order: 2 },
  'urgent-not-important': { label: '紧急不重要', color: '#06b6d4', order: 3 },
  'not-urgent-not-important': { label: '不紧急不重要', color: '#6b7280', order: 4 },
};

export const CATEGORY_COLORS: Record<CategoryColor, string> = {
  black: '#000000',
  gray: '#6b7280',
  white: '#ffffff',
};

export const STORAGE_KEYS = {
  TODOS: '@todos',
  CATEGORIES: '@categories',
  IDENTITIES: '@identities',
  ROLES: '@roles',
  SEARCH_HISTORY: '@search_history',
  FILTER_TEMPLATES: '@filter_templates',
  APP_STATE: '@app_state',
  BACKUPS: '@backups',
} as const;

export const DEFAULT_CATEGORY_ID = 'uncategorized';

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

export const MAX_CACHE_SIZE = 30 * 1024 * 1024; // 30MB

export const MAX_TITLE_LENGTH = 50;

export const MAX_DESCRIPTION_LENGTH = 500;

export const UNDO_REDO_LIMIT = 5;

export const SEARCH_HISTORY_LIMIT = 10;

export const BACKUP_RETENTION_DAYS = 7;

export const NOTIFICATION_PERMISSIONS = {
  android: ['android.permission.RECEIVE_BOOT_COMPLETED', 'android.permission.VIBRATE'],
  ios: ['ios.permission.ALERTS', 'ios.permission.BADGE', 'ios.permission.SOUND'],
};

export const ANIMATION_DURATION = {
  PAGE_TRANSITION: 300,
  FADE_IN: 200,
  SLIDE_UP: 250,
} as const;

export const BORDER_RADIUS = 8;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
} as const;

export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
} as const;
