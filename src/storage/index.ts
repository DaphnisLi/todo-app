import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, MAX_CACHE_SIZE } from '../constants';
import { Todo, Category, Identity, Role, SearchHistory, FilterTemplate, AppState, BackupData } from '../types';
import * as FileSystem from 'expo-file-system';

export class StorageService {
  // 基础存储方法
  static async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
      throw error;
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage remove error for key ${key}:`, error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  // 待办事项存储
  static async getTodos(): Promise<Todo[]> {
    const todos = await this.get<Todo[]>(STORAGE_KEYS.TODOS);
    return todos || [];
  }

  static async setTodos(todos: Todo[]): Promise<void> {
    await this.set(STORAGE_KEYS.TODOS, todos);
  }

  // 分类存储
  static async getCategories(): Promise<Category[]> {
    const categories = await this.get<Category[]>(STORAGE_KEYS.CATEGORIES);
    return categories || [];
  }

  static async setCategories(categories: Category[]): Promise<void> {
    await this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  // 身份存储
  static async getIdentities(): Promise<Identity[]> {
    const identities = await this.get<Identity[]>(STORAGE_KEYS.IDENTITIES);
    return identities || [];
  }

  static async setIdentities(identities: Identity[]): Promise<void> {
    await this.set(STORAGE_KEYS.IDENTITIES, identities);
  }

  // 角色存储
  static async getRoles(): Promise<Role[]> {
    const roles = await this.get<Role[]>(STORAGE_KEYS.ROLES);
    return roles || [];
  }

  static async setRoles(roles: Role[]): Promise<void> {
    await this.set(STORAGE_KEYS.ROLES, roles);
  }

  // 搜索历史存储
  static async getSearchHistory(): Promise<SearchHistory[]> {
    const history = await this.get<SearchHistory[]>(STORAGE_KEYS.SEARCH_HISTORY);
    return history || [];
  }

  static async setSearchHistory(history: SearchHistory[]): Promise<void> {
    await this.set(STORAGE_KEYS.SEARCH_HISTORY, history);
  }

  // 筛选模板存储
  static async getFilterTemplates(): Promise<FilterTemplate[]> {
    const templates = await this.get<FilterTemplate[]>(STORAGE_KEYS.FILTER_TEMPLATES);
    return templates || [];
  }

  static async setFilterTemplates(templates: FilterTemplate[]): Promise<void> {
    await this.set(STORAGE_KEYS.FILTER_TEMPLATES, templates);
  }

  // 应用状态存储
  static async getAppState(): Promise<AppState | null> {
    return this.get<AppState>(STORAGE_KEYS.APP_STATE);
  }

  static async setAppState(state: AppState): Promise<void> {
    await this.set(STORAGE_KEYS.APP_STATE, state);
  }

  // 备份存储
  static async getBackups(): Promise<BackupData[]> {
    const backups = await this.get<BackupData[]>(STORAGE_KEYS.BACKUPS);
    return backups || [];
  }

  static async setBackups(backups: BackupData[]): Promise<void> {
    await this.set(STORAGE_KEYS.BACKUPS, backups);
  }

  // 文件缓存管理
  static async getCacheSize(): Promise<number> {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return 0;

      const files = await FileSystem.readDirectoryAsync(cacheDir);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(cacheDir + file);
        if (fileInfo.exists && fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Get cache size error:', error);
      return 0;
    }
  }

  static async clearCache(): Promise<void> {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return;

      const files = await FileSystem.readDirectoryAsync(cacheDir);
      for (const file of files) {
        await FileSystem.deleteAsync(cacheDir + file);
      }
    } catch (error) {
      console.error('Clear cache error:', error);
      throw error;
    }
  }

  static async autoCleanCache(): Promise<void> {
    const cacheSize = await this.getCacheSize();
    if (cacheSize > MAX_CACHE_SIZE) {
      try {
        const cacheDir = FileSystem.cacheDirectory;
        if (!cacheDir) return;

        const files = await FileSystem.readDirectoryAsync(cacheDir);
        const fileInfos = [];

        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(cacheDir + file);
          if (fileInfo.exists && fileInfo.size) {
            fileInfos.push({
              name: file,
              size: fileInfo.size,
              uri: fileInfo.uri,
              modificationTime: fileInfo.modificationTime || 0,
            });
          }
        }

        // 按修改时间排序，删除最早的文件
        fileInfos.sort((a, b) => a.modificationTime - b.modificationTime);
        
        let currentSize = cacheSize;
        for (const file of fileInfos) {
          if (currentSize <= MAX_CACHE_SIZE * 0.8) break; // 清理到80%
          
          await FileSystem.deleteAsync(file.uri);
          currentSize -= file.size;
        }
      } catch (error) {
        console.error('Auto clean cache error:', error);
      }
    }
  }

  // 数据导出
  static async exportData(): Promise<BackupData> {
    const todos = await this.getTodos();
    const categories = await this.getCategories();
    const identities = await this.getIdentities();
    const roles = await this.getRoles();

    return {
      version: '1.0.0',
      timestamp: new Date(),
      todos,
      categories,
      identities,
      roles,
    };
  }

  // 数据导入
  static async importData(data: BackupData, mode: 'overwrite' | 'merge' = 'merge'): Promise<void> {
    if (mode === 'overwrite') {
      await this.setTodos(data.todos);
      await this.setCategories(data.categories);
      await this.setIdentities(data.identities);
      await this.setRoles(data.roles);
    } else {
      // 合并模式
      const existingTodos = await this.getTodos();
      const existingCategories = await this.getCategories();
      const existingIdentities = await this.getIdentities();
      const existingRoles = await this.getRoles();

      // 合并待办事项（避免重复）
      const mergedTodos = [...existingTodos];
      for (const todo of data.todos) {
        if (!mergedTodos.find(t => t.id === todo.id)) {
          mergedTodos.push(todo);
        }
      }

      // 合并分类
      const mergedCategories = [...existingCategories];
      for (const category of data.categories) {
        if (!mergedCategories.find(c => c.id === category.id)) {
          mergedCategories.push(category);
        }
      }

      // 合并身份
      const mergedIdentities = [...existingIdentities];
      for (const identity of data.identities) {
        if (!mergedIdentities.find(i => i.id === identity.id)) {
          mergedIdentities.push(identity);
        }
      }

      // 合并角色
      const mergedRoles = [...existingRoles];
      for (const role of data.roles) {
        if (!mergedRoles.find(r => r.id === role.id)) {
          mergedRoles.push(role);
        }
      }

      await this.setTodos(mergedTodos);
      await this.setCategories(mergedCategories);
      await this.setIdentities(mergedIdentities);
      await this.setRoles(mergedRoles);
    }
  }
}
