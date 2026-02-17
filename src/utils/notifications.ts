import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 配置通知处理器
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationManager {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }
    return false;
  }

  static async scheduleNotification(
    title: string,
    body: string,
    trigger: Date,
    identifier?: string
  ): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('通知权限未授予');
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
        identifier,
      });
      
      console.log('通知已安排:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('安排通知失败:', error);
      return null;
    }
  }

  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('通知已取消:', identifier);
    } catch (error) {
      console.error('取消通知失败:', error);
    }
  }

  static async updateNotification(
    identifier: string,
    title: string,
    body: string,
    trigger: Date
  ): Promise<string | null> {
    // 先取消旧通知
    await this.cancelNotification(identifier);
    // 安排新通知
    return await this.scheduleNotification(title, body, trigger, identifier);
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('获取已安排的通知失败:', error);
      return [];
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('所有通知已取消');
    } catch (error) {
      console.error('取消所有通知失败:', error);
    }
  }
}

// 待办事项通知管理
export class TodoNotificationManager {
  private static getNotificationId(todoId: string): string {
    return `todo-${todoId}`;
  }

  static async scheduleTodoReminder(
    todoId: string,
    title: string,
    description: string | undefined,
    dueDate: Date
  ): Promise<void> {
    const notificationId = this.getNotificationId(todoId);
    const notificationTitle = '待办事项提醒';
    const notificationBody = description 
      ? `${title} - ${description}` 
      : title;

    // 在截止时间前15分钟提醒
    const reminderTime = new Date(dueDate.getTime() - 15 * 60 * 1000);
    
    // 如果提醒时间已过，则立即提醒
    const triggerTime = reminderTime > new Date() ? reminderTime : new Date(Date.now() + 5000);

    await NotificationManager.scheduleNotification(
      notificationTitle,
      notificationBody,
      triggerTime,
      notificationId
    );
  }

  static async updateTodoReminder(
    todoId: string,
    title: string,
    description: string | undefined,
    dueDate: Date
  ): Promise<void> {
    const notificationId = this.getNotificationId(todoId);
    const notificationTitle = '待办事项提醒';
    const notificationBody = description 
      ? `${title} - ${description}` 
      : title;

    const reminderTime = new Date(dueDate.getTime() - 15 * 60 * 1000);
    const triggerTime = reminderTime > new Date() ? reminderTime : new Date(Date.now() + 5000);

    await NotificationManager.updateNotification(
      notificationId,
      notificationTitle,
      notificationBody,
      triggerTime
    );
  }

  static async cancelTodoReminder(todoId: string): Promise<void> {
    const notificationId = this.getNotificationId(todoId);
    await NotificationManager.cancelNotification(notificationId);
  }

  static async scheduleOverdueNotification(
    todoId: string,
    title: string,
    description: string | undefined,
    dueDate: Date
  ): Promise<void> {
    const notificationId = `${this.getNotificationId(todoId)}-overdue`;
    const notificationTitle = '待办事项已过期';
    const notificationBody = description 
      ? `${title} - ${description} (已过期)` 
      : `${title} (已过期)`;

    // 在截止时间后1小时提醒过期
    const overdueTime = new Date(dueDate.getTime() + 60 * 60 * 1000);

    await NotificationManager.scheduleNotification(
      notificationTitle,
      notificationBody,
      overdueTime,
      notificationId
    );
  }
}
