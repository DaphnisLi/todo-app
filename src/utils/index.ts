import { format, isPast, isToday, isTomorrow, isThisWeek, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export class DateUtils {
  static formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd', { locale: zhCN });
  }

  static formatDateTime(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN });
  }

  static formatTime(date: Date): string {
    return format(date, 'HH:mm', { locale: zhCN });
  }

  static getRelativeDate(date: Date): string {
    if (isToday(date)) return '今天';
    if (isTomorrow(date)) return '明天';
    if (isThisWeek(date, { weekStartsOn: 1 })) return '本周日';
    return this.formatDate(date);
  }

  static getQuickDates(): Array<{ label: string; date: Date }> {
    return [
      { label: '今天', date: new Date() },
      { label: '明天', date: addDays(new Date(), 1) },
      { label: '本周日', date: this.getThisSunday() },
      { label: '自定义', date: new Date() },
    ];
  }

  private static getThisSunday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
    return addDays(today, daysUntilSunday);
  }

  static isOverdue(date: Date): boolean {
    return isPast(date) && !isToday(date);
  }

  static getTimeRemaining(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return '已过期';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天`;
    if (hours > 0) return `${hours}小时`;
    return '1小时内';
  }

  static getNextRepeatDate(date: Date, rule: { type: string; interval: number }): Date {
    switch (rule.type) {
      case 'daily':
        return addDays(date, rule.interval);
      case 'weekly':
        return addWeeks(date, rule.interval);
      case 'monthly':
        return addMonths(date, rule.interval);
      case 'yearly':
        return addYears(date, rule.interval);
      default:
        return date;
    }
  }
}

export class FileUtils {
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  static isDocumentFile(filename: string): boolean {
    const docExtensions = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    return docExtensions.includes(this.getFileExtension(filename));
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = this.getFileExtension(originalName);
    const nameWithoutExt = originalName.replace(`.${extension}`, '');
    
    return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
  }
}

export class ValidationUtils {
  static validateTitle(title: string): { isValid: boolean; error?: string } {
    if (!title.trim()) {
      return { isValid: false, error: '标题不能为空' };
    }
    
    if (title.length > 50) {
      return { isValid: false, error: '标题不能超过50个字符' };
    }
    
    return { isValid: true };
  }

  static validateDescription(description: string): { isValid: boolean; error?: string } {
    if (description.length > 500) {
      return { isValid: false, error: '详情不能超过500个字符' };
    }
    
    return { isValid: true };
  }

  static validateFileSize(size: number): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (size > maxSize) {
      return { isValid: false, error: '文件大小不能超过10MB' };
    }
    
    return { isValid: true };
  }

  static validateFileType(filename: string): { isValid: boolean; error?: string } {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const extension = this.getFileExtension(filename);
    
    if (!allowedExtensions.includes(extension)) {
      return { isValid: false, error: '不支持的文件类型' };
    }
    
    return { isValid: true };
  }

  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}

export class SearchUtils {
  static highlightText(text: string, query: string): string {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '**$1**');
  }

  static getSearchScore(todo: any, query: string): number {
    if (!query.trim()) return 0;
    
    const lowerQuery = query.toLowerCase();
    let score = 0;
    
    // 标题匹配得分最高
    if (todo.title.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }
    
    // 描述匹配
    if (todo.description && todo.description.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }
    
    // 分类匹配
    if (todo.categoryName && todo.categoryName.toLowerCase().includes(lowerQuery)) {
      score += 3;
    }
    
    return score;
  }

  static filterAndSort<T>(
    items: T[],
    query: string,
    getSearchableText: (item: T) => string,
    getScore: (item: T) => number = () => 0
  ): T[] {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    
    return items
      .filter(item => {
        const text = getSearchableText(item).toLowerCase();
        return text.includes(lowerQuery);
      })
      .sort((a, b) => getScore(b) - getScore(a));
  }
}

export class NotificationUtils {
  static async requestPermissions(): Promise<boolean> {
    try {
      // 这里会在实际实现中使用 expo-notifications
      return true;
    } catch (error) {
      console.error('Request notification permissions error:', error);
      return false;
    }
  }

  static scheduleNotification(
    id: string,
    title: string,
    body: string,
    date: Date
  ): void {
    try {
      // 这里会在实际实现中使用 expo-notifications
      console.log(`Schedule notification ${id}: ${title} at ${date}`);
    } catch (error) {
      console.error('Schedule notification error:', error);
    }
  }

  static cancelNotification(id: string): void {
    try {
      // 这里会在实际实现中使用 expo-notifications
      console.log(`Cancel notification ${id}`);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  }

  static formatNotificationMessage(todo: any): { title: string; body: string } {
    const title = '待办事项提醒';
    const body = todo.dueDate 
      ? `${todo.title} - 截止时间: ${DateUtils.formatDateTime(todo.dueDate)}`
      : todo.title;
    
    return { title, body };
  }
}

export class ArrayUtils {
  static moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const result = [...array];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  }

  static reorderById<T extends { id: string }>(
    items: T[],
    orderedIds: string[]
  ): T[] {
    const itemMap = new Map(items.map(item => [item.id, item]));
    return orderedIds.map(id => itemMap.get(id)).filter(Boolean) as T[];
  }

  static groupBy<T, K extends keyof any>(
    array: T[],
    key: (item: T) => K
  ): Record<K, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = key(item);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }

  static uniqueById<T extends { id: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }
}
