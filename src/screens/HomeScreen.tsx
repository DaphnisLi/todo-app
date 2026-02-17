import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { useAppState } from '../hooks/useAppState';
import { TodoList } from '../components/TodoList';
import { AddTodoModal } from '../components/AddTodoModal';
import { CategoryManager } from '../components/CategoryManager';
import { Todo, Priority, Category } from '../types';
import { SPACING, FONT_SIZES, BORDER_RADIUS, PRIORITIES } from '../constants';
import { getCategoryColor } from '../constants/colors';

export function HomeScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    loadTodos,
  } = useTodos();

  const { categories, getCategoryName, addCategory, updateCategory, deleteCategory } = useCategories();
  const { appState, setCurrentCategoryId } = useAppState();

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAddCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addCategory(categoryData);
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    await updateCategory(id, updates);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addTodo(todoData);
    } catch (error) {
      Alert.alert('错误', '添加待办事项失败');
    }
  };

  const handleEditTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTodo) return;
    
    try {
      await updateTodo(editingTodo.id, todoData);
      setEditingTodo(undefined);
    } catch (error) {
      Alert.alert('错误', '更新待办事项失败');
    }
  };

  const handleDeleteTodo = (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个待办事项吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => deleteTodo(id),
        },
      ]
    );
  };

  const handlePressTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowAddModal(true);
  };

  const filteredTodos = useMemo(() => {
    let filteredTodos = todos.filter(todo => !todo.deletedAt);
    
    // 应用状态筛选
    if (selectedFilter === 'active') {
      filteredTodos = filteredTodos.filter(todo => !todo.isCompleted);
    } else if (selectedFilter === 'completed') {
      filteredTodos = filteredTodos.filter(todo => todo.isCompleted);
    }

    // 应用分类筛选
    if (appState.currentCategoryId) {
      filteredTodos = filteredTodos.filter(todo => todo.categoryId === appState.currentCategoryId);
    }

    // 应用搜索过滤
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filteredTodos = filteredTodos.filter(todo =>
        todo.title.toLowerCase().includes(searchLower) ||
        (todo.description && todo.description.toLowerCase().includes(searchLower))
      );
    }

    // 应用排序
    filteredTodos.sort((a, b) => {
      let comparison = 0;
      
      switch (appState.sortBy) {
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
        case 'createdAt':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return appState.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredTodos;
  }, [todos, selectedFilter, appState.currentCategoryId, appState.sortBy, appState.sortOrder, searchQuery]);

  const stats = {
    total: todos.filter(t => !t.deletedAt).length,
    completed: todos.filter(t => !t.deletedAt && t.isCompleted).length,
    pending: todos.filter(t => !t.deletedAt && !t.isCompleted).length,
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>我的待办</Text>
        <TouchableOpacity
          style={styles.categoryManageButton}
          onPress={() => setShowCategoryManager(true)}
        >
          <Text style={styles.categoryManageButtonText}>管理分类</Text>
        </TouchableOpacity>
      </View>
      
      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>总计</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>进行中</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>已完成</Text>
        </View>
      </View>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="搜索待办事项..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* 筛选按钮 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: '全部' },
          { key: 'active', label: '进行中' },
          { key: 'completed', label: '已完成' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.activeFilterButtonText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* 分类筛选按钮 */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            !appState.currentCategoryId && styles.activeFilterButton,
          ]}
          onPress={() => setCurrentCategoryId(undefined)}
        >
          <Text
            style={[
              styles.filterButtonText,
              !appState.currentCategoryId && styles.activeFilterButtonText,
            ]}
          >
            全部分类
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              appState.currentCategoryId === category.id && styles.activeFilterButton,
            ]}
            onPress={() => setCurrentCategoryId(category.id)}
          >
            <View
              style={[
                styles.categoryIndicator,
                { backgroundColor: getCategoryColor(category.color) },
              ]}
            />
            <Text
              style={[
                styles.filterButtonText,
                appState.currentCategoryId === category.id && styles.activeFilterButtonText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>暂无待办事项</Text>
      <Text style={styles.emptyDescription}>
        点击右下角的添加按钮创建第一个待办事项
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>我的待办</Text>
            <TouchableOpacity
              style={styles.categoryManageButton}
              onPress={() => setShowCategoryManager(true)}
            >
              <Text style={styles.categoryManageButtonText}>管理分类</Text>
            </TouchableOpacity>
          </View>
          
          {/* 统计信息 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>总计</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>进行中</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>已完成</Text>
            </View>
          </View>

          {/* 搜索框 */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="搜索待办事项..."
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* 状态筛选 */}
          <View style={styles.statusFilterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              {[
                { key: 'all', label: '全部' },
                { key: 'active', label: '进行中' },
                { key: 'completed', label: '已完成' },
              ].map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && styles.activeFilterButton,
                  ]}
                  onPress={() => setSelectedFilter(filter.key as any)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilter === filter.key && styles.activeFilterButtonText,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 分类筛选 */}
          <View style={styles.categoryFilterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  !appState.currentCategoryId && styles.activeFilterButton,
                ]}
                onPress={() => setCurrentCategoryId(undefined)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    !appState.currentCategoryId && styles.activeFilterButtonText,
                  ]}
                >
                  全部分类
                </Text>
              </TouchableOpacity>
              
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterButton,
                    appState.currentCategoryId === category.id && styles.activeFilterButton,
                  ]}
                  onPress={() => setCurrentCategoryId(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIndicator,
                      { backgroundColor: getCategoryColor(category.color) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      appState.currentCategoryId === category.id && styles.activeFilterButtonText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        
        <View style={styles.content}>
          <TodoList
            todos={filteredTodos}
            onPressTodo={handlePressTodo}
            onToggleComplete={toggleTodoComplete}
            onEditTodo={handlePressTodo}
            onDeleteTodo={handleDeleteTodo}
            renderEmpty={renderEmptyState}
            categories={categories}
            getCategoryName={getCategoryName}
          />
        </View>

        {/* 添加按钮 */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingTodo(undefined);
            setShowAddModal(true);
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        {/* 添加/编辑模态框 */}
        <AddTodoModal
          visible={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingTodo(undefined);
          }}
          onSave={editingTodo ? handleEditTodo : handleAddTodo}
          categories={categories}
          currentIdentityId={appState.currentIdentityId}
          editingTodo={editingTodo}
        />

        {/* 分类管理模态框 */}
        <CategoryManager
          visible={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          categories={categories}
          onAddCategory={addCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          currentIdentityId={appState.currentIdentityId}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '700',
    color: '#1f2937',
  },
  categoryManageButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS,
  },
  categoryManageButtonText: {
    fontSize: FONT_SIZES.SM,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.LG,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.XL,
    fontWeight: '600',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: FONT_SIZES.XS,
    color: '#6b7280',
    marginTop: SPACING.XS,
  },
  searchContainer: {
    marginBottom: SPACING.MD,
  },
  statusFilterSection: {
    marginBottom: SPACING.SM,
  },
  categoryFilterSection: {
    marginBottom: SPACING.SM,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.SM,
    fontSize: FONT_SIZES.MD,
    backgroundColor: '#f9fafb',
  },
  filterContainer: {
    marginBottom: SPACING.SM,
  },
  filterContent: {
    paddingRight: SPACING.MD,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.SM,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#f3f4f6',
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: FONT_SIZES.SM,
    color: '#6b7280',
  },
  activeFilterButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.MD,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FONT_SIZES.SM,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: SPACING.LG,
    right: SPACING.MD,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.XS,
  },
});
