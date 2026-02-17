import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { useAppState } from '../hooks/useAppState';
import { TodoList } from '../components/TodoList';
import { AddTodoModal } from '../components/AddTodoModal';
import { Todo, Priority } from '../types';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';

export function HomeScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all');

  const {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    getFilteredAndSortedTodos,
    loadTodos,
  } = useTodos();

  const { categories, getCategoryName } = useCategories();
  const { appState } = useAppState();

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

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

  const getFilteredTodos = () => {
    let filterOptions = {};
    
    if (selectedFilter === 'active') {
      filterOptions = { ...filterOptions, isCompleted: false };
    } else if (selectedFilter === 'completed') {
      filterOptions = { ...filterOptions, isCompleted: true };
    }

    if (appState.currentCategoryId) {
      filterOptions = { ...filterOptions, categoryId: [appState.currentCategoryId] };
    }

    return getFilteredAndSortedTodos(
      filterOptions,
      appState.sortBy,
      appState.sortOrder
    );
  };

  const stats = {
    total: todos.filter(t => !t.deletedAt).length,
    completed: todos.filter(t => !t.deletedAt && t.isCompleted).length,
    pending: todos.filter(t => !t.deletedAt && !t.isCompleted).length,
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>我的待办</Text>
      
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
    <View style={styles.container}>
      {renderHeader()}
      
      <TodoList
        todos={getFilteredTodos()}
        loading={loading}
        onRefresh={loadTodos}
        onPressTodo={handlePressTodo}
        onToggleComplete={toggleTodoComplete}
        onEditTodo={handlePressTodo}
        onDeleteTodo={handleDeleteTodo}
        renderEmpty={renderEmptyState}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: SPACING.MD,
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
});
