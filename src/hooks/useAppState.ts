import { useState, useEffect, useCallback } from 'react';
import { AppState, ViewMode, SortOption, SortOrder } from '../types';
import { StorageService } from '../storage';

const DEFAULT_APP_STATE: AppState = {
  currentIdentityId: '',
  viewMode: 'list',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  searchQuery: '',
  filterOptions: {},
};

export function useAppState() {
  const [appState, setAppState] = useState<AppState>(DEFAULT_APP_STATE);
  const [loading, setLoading] = useState(true);

  // 加载应用状态
  const loadAppState = useCallback(async () => {
    try {
      setLoading(true);
      const storedState = await StorageService.getAppState();
      if (storedState) {
        setAppState(storedState);
      }
    } catch (error) {
      console.error('Load app state error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存应用状态
  const saveAppState = useCallback(async (newState: AppState) => {
    try {
      await StorageService.setAppState(newState);
      setAppState(newState);
    } catch (error) {
      console.error('Save app state error:', error);
    }
  }, []);

  // 更新当前身份
  const setCurrentIdentityId = useCallback((identityId: string) => {
    const newState = { ...appState, currentIdentityId: identityId };
    saveAppState(newState);
  }, [appState, saveAppState]);

  // 更新视图模式
  const setViewMode = useCallback((viewMode: ViewMode) => {
    const newState = { ...appState, viewMode };
    saveAppState(newState);
  }, [appState, saveAppState]);

  // 更新当前分类
  const setCurrentCategoryId = useCallback((categoryId: string | undefined) => {
    const newState = { ...appState, currentCategoryId: categoryId };
    saveAppState(newState);
  }, [appState, saveAppState]);

  // 更新排序
  const setSortBy = useCallback((sortBy: SortOption) => {
    const newState = { ...appState, sortBy };
    saveAppState(newState);
  }, [appState, saveAppState]);

  const setSortOrder = useCallback((sortOrder: SortOrder) => {
    const newState = { ...appState, sortOrder };
    saveAppState(newState);
  }, [appState, saveAppState]);

  // 更新搜索查询
  const setSearchQuery = useCallback((searchQuery: string) => {
    const newState = { ...appState, searchQuery };
    saveAppState(newState);
  }, [appState, saveAppState]);

  // 更新筛选选项
  const setFilterOptions = useCallback((filterOptions: AppState['filterOptions']) => {
    const newState = { ...appState, filterOptions };
    saveAppState(newState);
  }, [appState, saveAppState]);

  // 重置筛选
  const resetFilters = useCallback(() => {
    const newState = {
      ...appState,
      filterOptions: {},
      searchQuery: '',
    };
    saveAppState(newState);
  }, [appState, saveAppState]);

  useEffect(() => {
    loadAppState();
  }, [loadAppState]);

  return {
    appState,
    loading,
    setCurrentIdentityId,
    setViewMode,
    setCurrentCategoryId,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    setFilterOptions,
    resetFilters,
  };
}
