import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { StorageService } from '../storage';
import { DEFAULT_CATEGORY_ID } from '../constants';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载分类
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storedCategories = await StorageService.getCategories();
      setCategories(storedCategories.map(category => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      })));
    } catch (err) {
      setError('加载分类失败');
      console.error('Load categories error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存分类
  const saveCategories = useCallback(async (newCategories: Category[]) => {
    try {
      await StorageService.setCategories(newCategories);
      setCategories(newCategories);
    } catch (err) {
      setError('保存分类失败');
      console.error('Save categories error:', err);
      throw err;
    }
  }, []);

  // 添加分类
  const addCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newCategories = [...categories, newCategory];
    await saveCategories(newCategories);
    return newCategory;
  }, [categories, saveCategories]);

  // 更新分类
  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const newCategories = categories.map(category =>
      category.id === id
        ? { ...category, ...updates, updatedAt: new Date() }
        : category
    );
    await saveCategories(newCategories);
  }, [categories, saveCategories]);

  // 删除分类
  const deleteCategory = useCallback(async (id: string) => {
    if (id === DEFAULT_CATEGORY_ID) {
      throw new Error('不能删除默认分类');
    }
    
    const newCategories = categories.filter(category => category.id !== id);
    await saveCategories(newCategories);
  }, [categories, saveCategories]);

  // 获取分类名称
  const getCategoryName = useCallback((categoryId: string | undefined): string => {
    if (!categoryId) return '未分类';
    if (categoryId === DEFAULT_CATEGORY_ID) return '未分类';
    
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未分类';
  }, [categories]);

  // 获取分类颜色
  const getCategoryColor = useCallback((categoryId: string | undefined): string => {
    if (!categoryId) return '#6b7280';
    if (categoryId === DEFAULT_CATEGORY_ID) return '#6b7280';
    
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  }, [categories]);

  // 按身份获取分类
  const getCategoriesByIdentity = useCallback((identityId: string): Category[] => {
    return categories.filter(category => category.identityId === identityId);
  }, [categories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryName,
    getCategoryColor,
    getCategoriesByIdentity,
  };
}
