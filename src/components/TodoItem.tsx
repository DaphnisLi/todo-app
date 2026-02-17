import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Todo, Priority, Category } from '../types';
import { PRIORITIES, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants';
import { DateUtils } from '../utils';
import { getCategoryColor } from '../constants/colors';

interface TodoItemProps {
  todo: Todo;
  onPress: (todo: Todo) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  category?: Category;
}

export function TodoItem({
  todo,
  onPress,
  onToggleComplete,
  onEdit,
  onDelete,
  category,
}: TodoItemProps) {
  const priorityColor = PRIORITIES[todo.priority].color;
  const isOverdue = todo.dueDate && DateUtils.isOverdue(todo.dueDate) && !todo.isCompleted;

  const handleSwipeLeft = () => {
    onDelete(todo.id);
  };

  return (
    <View style={[styles.container, todo.isCompleted && styles.completedContainer]}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => onPress(todo)}
        activeOpacity={0.7}
      >
        {/* 左侧优先级指示器 */}
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
        
        {/* 主要内容 */}
        <View style={styles.mainContent}>
          {/* 标题和描述 */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                todo.isCompleted && styles.completedTitle,
              ]}
              numberOfLines={1}
            >
              {todo.title}
            </Text>
            
            {todo.description && (
              <Text
                style={[
                  styles.description,
                  todo.isCompleted && styles.completedDescription,
                ]}
                numberOfLines={2}
              >
                {todo.description}
              </Text>
            )}
          </View>

          {/* 底部信息 */}
          <View style={styles.footer}>
            {todo.dueDate && (
              <View style={styles.dueDateContainer}>
                <Text
                  style={[
                    styles.dueDate,
                    isOverdue && styles.overdueDate,
                  ]}
                >
                  {DateUtils.getRelativeDate(todo.dueDate)}
                  {isOverdue && ' (已过期)'}
                </Text>
              </View>
            )}

            {/* 分类标签 */}
            {category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 右侧完成状态按钮 */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              todo.isCompleted && styles.completedButton,
            ]}
            onPress={() => onToggleComplete(todo.id)}
          >
            <Text style={styles.completeButtonText}>
              {todo.isCompleted ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: SPACING.SM,
    marginVertical: 3, // 增加卡片间距
    borderRadius: BORDER_RADIUS,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.SM, // 减少内边距
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    borderTopLeftRadius: BORDER_RADIUS,
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  mainContent: {
    flex: 1,
    marginLeft: SPACING.SM,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2, // 减少标题底部间距
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  description: {
    fontSize: FONT_SIZES.SM,
    color: '#6b7280',
    lineHeight: 18,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4, // 减少顶部间距
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: FONT_SIZES.XS,
    color: '#6b7280',
  },
  overdueDate: {
    color: '#ef4444',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center', // 让完成按钮垂直居中
    minWidth: 70, // 减少最小宽度
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: SPACING.XS, // 减少水平内边距
    paddingVertical: 2, // 减少垂直内边距
    borderRadius: BORDER_RADIUS / 2,
    minHeight: 20, // 减少最小高度
    alignSelf: 'flex-start', // 左对齐
  },
  categoryText: {
    fontSize: FONT_SIZES.XS,
    color: '#374151',
    fontWeight: '500',
  },
  completeButton: {
    width: 20, // 减少按钮宽度
    height: 20, // 减少按钮高度
    borderRadius: 10, // 相应调整圆角
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#10b981',
  },
  completeButtonText: {
    fontSize: FONT_SIZES.SM,
    color: '#ffffff',
    fontWeight: '600',
  },
});
