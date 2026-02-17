import { useState, useEffect, useCallback } from 'react';
import { Todo, FilterOptions, SortOption, SortOrder } from '../types';
import { StorageService } from '../storage';
import { ArrayUtils, DateUtils } from '../utils';
import { PRIORITIES } from '../constants';
import { TodoNotificationManager } from '../utils/notifications';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载待办事项
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storedTodos = await StorageService.getTodos();
      setTodos(storedTodos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : undefined,
      })));
    } catch (err) {
      setError('加载待办事项失败');
      console.error('Load todos error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存待办事项
  const saveTodos = useCallback(async (newTodos: Todo[]) => {
    try {
      await StorageService.setTodos(newTodos);
      setTodos(newTodos);
    } catch (err) {
      setError('保存待办事项失败');
      console.error('Save todos error:', err);
      throw err;
    }
  }, []);

  // 添加待办事项
  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 如果有截止日期，安排通知
    if (newTodo.dueDate) {
      await TodoNotificationManager.scheduleTodoReminder(
        newTodo.id,
        newTodo.title,
        newTodo.description,
        newTodo.dueDate
      );
    }

    const newTodos = [newTodo, ...todos];
    await saveTodos(newTodos);
    return newTodo;
  }, [todos, saveTodos]);

  // 更新待办事项
  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    const existingTodo = todos.find(todo => todo.id === id);
    
    // 取消旧通知
    if (existingTodo?.dueDate) {
      await TodoNotificationManager.cancelTodoReminder(id);
    }

    const newTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, ...updates, updatedAt: new Date() }
        : todo
    );

    const updatedTodo = newTodos.find(todo => todo.id === id);
    
    // 如果有新的截止日期，安排新通知
    if (updatedTodo?.dueDate) {
      await TodoNotificationManager.scheduleTodoReminder(
        updatedTodo.id,
        updatedTodo.title,
        updatedTodo.description,
        updatedTodo.dueDate
      );
    }

    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 删除待办事项（软删除）
  const deleteTodo = useCallback(async (id: string) => {
    // 取消通知
    await TodoNotificationManager.cancelTodoReminder(id);
    
    const newTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, deletedAt: new Date(), updatedAt: new Date() }
        : todo
    );
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 永久删除待办事项
  const permanentDeleteTodo = useCallback(async (id: string) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 恢复待办事项
  const restoreTodo = useCallback(async (id: string) => {
    const newTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, deletedAt: undefined, updatedAt: new Date() }
        : todo
    );
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 批量删除
  const batchDeleteTodos = useCallback(async (ids: string[]) => {
    const newTodos = todos.map(todo =>
      ids.includes(todo.id)
        ? { ...todo, deletedAt: new Date(), updatedAt: new Date() }
        : todo
    );
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 批量永久删除
  const batchPermanentDeleteTodos = useCallback(async (ids: string[]) => {
    const newTodos = todos.filter(todo => !ids.includes(todo.id));
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 批量恢复
  const batchRestoreTodos = useCallback(async (ids: string[]) => {
    const newTodos = todos.map(todo =>
      ids.includes(todo.id)
        ? { ...todo, deletedAt: undefined, updatedAt: new Date() }
        : todo
    );
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 切换完成状态
  const toggleTodoComplete = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    await updateTodo(id, { isCompleted: !todo.isCompleted });
  }, [todos, updateTodo]);

  // 批量切换完成状态
  const batchToggleComplete = useCallback(async (ids: string[], isCompleted: boolean) => {
    const newTodos = todos.map(todo =>
      ids.includes(todo.id)
        ? { ...todo, isCompleted, updatedAt: new Date() }
        : todo
    );
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 重新排序
  const reorderTodos = useCallback(async (fromIndex: number, toIndex: number) => {
    const newTodos = ArrayUtils.moveItem(todos, fromIndex, toIndex);
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 按ID重新排序
  const reorderTodosById = useCallback(async (orderedIds: string[]) => {
    const newTodos = ArrayUtils.reorderById(todos, orderedIds);
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 筛选和排序
  const getFilteredAndSortedTodos = useCallback((
    filterOptions: FilterOptions = {},
    sortBy: SortOption = 'createdAt',
    sortOrder: SortOrder = 'desc',
    includeDeleted: boolean = false
  ) => {
    let filteredTodos = todos.filter(todo => {
      // 删除状态筛选
      if (!includeDeleted && todo.deletedAt) return false;
      if (includeDeleted && !todo.deletedAt) return false;

      // 完成状态筛选
      if (filterOptions.isCompleted !== undefined && todo.isCompleted !== filterOptions.isCompleted) {
        return false;
      }

      // 优先级筛选
      if (filterOptions.priority && filterOptions.priority.length > 0) {
        if (!filterOptions.priority.includes(todo.priority)) return false;
      }

      // 分类筛选
      if (filterOptions.categoryId && filterOptions.categoryId.length > 0) {
        if (!todo.categoryId || !filterOptions.categoryId.includes(todo.categoryId)) return false;
      }

      // 时间范围筛选
      if (filterOptions.dateRange) {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        if (dueDate < filterOptions.dateRange.start || dueDate > filterOptions.dateRange.end) {
          return false;
        }
      }

      // 身份筛选
      if (filterOptions.identityId && todo.identityId !== filterOptions.identityId) {
        return false;
      }

      // 负责人筛选
      if (filterOptions.assigneeId && todo.assigneeId !== filterOptions.assigneeId) {
        return false;
      }

      return true;
    });

    // 排序
    filteredTodos.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = PRIORITIES[a.priority].order - PRIORITIES[b.priority].order;
          comparison = priorityOrder;
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'completed':
          comparison = Number(a.isCompleted) - Number(b.isCompleted);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredTodos;
  }, [todos]);

  // 搜索待办事项
  const searchTodos = useCallback((query: string) => {
    if (!query.trim()) return todos;

    const lowerQuery = query.toLowerCase();
    
    return todos
      .filter(todo => !todo.deletedAt)
      .filter(todo => 
        todo.title.toLowerCase().includes(lowerQuery) ||
        (todo.description && todo.description.toLowerCase().includes(lowerQuery))
      )
      .map(todo => ({
        ...todo,
        score: getSearchScore(todo, query),
      }))
      .sort((a, b) => b.score - a.score);
  }, [todos]);

  // 获取搜索得分
  const getSearchScore = (todo: Todo, query: string): number => {
    if (!query.trim()) return 0;
    
    const lowerQuery = query.toLowerCase();
    let score = 0;
    
    if (todo.title.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }
    
    if (todo.description && todo.description.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }
    
    return score;
  };

  // 清空回收站（删除超过7天的项目）
  const emptyRecycleBin = useCallback(async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newTodos = todos.filter(todo => {
      if (!todo.deletedAt) return true;
      return new Date(todo.deletedAt) > sevenDaysAgo;
    });
    
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  // 获取统计信息
  const getStats = useCallback(() => {
    const activeTodos = todos.filter(todo => !todo.deletedAt);
    const deletedTodos = todos.filter(todo => todo.deletedAt);
    
    return {
      total: activeTodos.length,
      completed: activeTodos.filter(todo => todo.isCompleted).length,
      pending: activeTodos.filter(todo => !todo.isCompleted).length,
      overdue: activeTodos.filter(todo => 
        !todo.isCompleted && 
        todo.dueDate && 
        DateUtils.isOverdue(todo.dueDate)
      ).length,
      deleted: deletedTodos.length,
      byPriority: Object.keys(PRIORITIES).reduce((acc, priority) => {
        acc[priority as keyof typeof PRIORITIES] = activeTodos.filter(
          todo => todo.priority === priority
        ).length;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [todos]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return {
    todos,
    loading,
    error,
    loadTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    permanentDeleteTodo,
    restoreTodo,
    batchDeleteTodos,
    batchPermanentDeleteTodos,
    batchRestoreTodos,
    toggleTodoComplete,
    batchToggleComplete,
    reorderTodos,
    reorderTodosById,
    getFilteredAndSortedTodos,
    searchTodos,
    emptyRecycleBin,
    getStats,
  };
}
