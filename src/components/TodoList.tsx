import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
} from 'react-native';
import { Todo, Category } from '../types';
import { TodoItem } from './TodoItem';
import { SPACING, FONT_SIZES } from '../constants';

interface TodoListProps {
  todos: Todo[];
  onPressTodo: (todo: Todo) => void;
  onToggleComplete: (id: string) => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  renderEmpty?: () => React.ReactNode;
  categories?: Category[];
  getCategoryName?: (categoryId: string | undefined) => string;
}

export function TodoList({
  todos,
  onPressTodo,
  onToggleComplete,
  onEditTodo,
  onDeleteTodo,
  renderEmpty,
  categories,
  getCategoryName,
}: TodoListProps) {
  const renderItem = ({ item }: { item: Todo }) => {
    const category = categories?.find(c => c.id === item.categoryId);
    
    return (
      <TodoItem
        todo={item}
        onPress={onPressTodo}
        onToggleComplete={onToggleComplete}
        onEdit={onEditTodo}
        onDelete={onDeleteTodo}
        category={category}
      />
    );
  };

  const renderEmptyState = () => {
    if (renderEmpty) {
      return renderEmpty();
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>暂无待办事项</Text>
        <Text style={styles.emptyDescription}>
          点击添加按钮创建第一个待办事项
        </Text>
      </View>
    );
  };

  const keyExtractor = (item: Todo) => item.id;

  return (
    <View style={styles.container}>
      <FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          todos.length === 0 && styles.emptyContentContainer,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContentContainer: {
    flexGrow: 1,
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
});
