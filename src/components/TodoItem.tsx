import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Todo, Priority } from '../types';
import { PRIORITIES, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants';
import { DateUtils } from '../utils';

interface TodoItemProps {
  todo: Todo;
  onPress: (todo: Todo) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function TodoItem({
  todo,
  onPress,
  onToggleComplete,
  onEdit,
  onDelete,
  isDragging = false,
}: TodoItemProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDragging ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isDragging, animatedValue]);

  const priorityColor = PRIORITIES[todo.priority].color;
  const isOverdue = todo.dueDate && DateUtils.isOverdue(todo.dueDate) && !todo.isCompleted;

  const handleLongPress = () => {
    onEdit(todo);
  };

  const handleSwipeLeft = () => {
    onDelete(todo.id);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.7],
          }),
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.95],
              }),
            },
            {
              rotate: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '2deg'],
              }),
            },
          ],
        },
        todo.isCompleted && styles.completedContainer,
        isOverdue && styles.overdueContainer,
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => onPress(todo)}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        {/* 优先级指示器 */}
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: priorityColor },
          ]}
        />

        {/* 复选框 */}
        <TouchableOpacity
          style={[styles.checkbox, todo.isCompleted && styles.checkedCheckbox]}
          onPress={() => onToggleComplete(todo.id)}
          activeOpacity={0.7}
        >
          {todo.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* 内容区域 */}
        <View style={styles.textContent}>
          <Text
            style={[
              styles.title,
              todo.isCompleted && styles.completedTitle,
            ]}
            numberOfLines={2}
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

            {todo.attachments.length > 0 && (
              <View style={styles.attachmentContainer}>
                <Text style={styles.attachmentText}>
                  📎 {todo.attachments.length}
                </Text>
              </View>
            )}

            {todo.comments.length > 0 && (
              <View style={styles.commentContainer}>
                <Text style={styles.commentText}>
                  💬 {todo.comments.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(todo)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>编辑</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: SPACING.SM,
    marginVertical: SPACING.XS,
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
  overdueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.MD,
    alignItems: 'flex-start',
  },
  priorityIndicator: {
    width: 4,
    borderTopLeftRadius: BORDER_RADIUS,
    borderBottomLeftRadius: BORDER_RADIUS,
    marginRight: SPACING.SM,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: SPACING.SM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: SPACING.XS,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  description: {
    fontSize: FONT_SIZES.SM,
    color: '#6b7280',
    marginBottom: SPACING.SM,
  },
  completedDescription: {
    color: '#d1d5db',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dueDateContainer: {
    marginRight: SPACING.SM,
  },
  dueDate: {
    fontSize: FONT_SIZES.XS,
    color: '#6b7280',
  },
  overdueDate: {
    color: '#ef4444',
    fontWeight: '500',
  },
  attachmentContainer: {
    marginRight: SPACING.SM,
  },
  attachmentText: {
    fontSize: FONT_SIZES.XS,
    color: '#6b7280',
  },
  commentContainer: {
    marginRight: SPACING.SM,
  },
  commentText: {
    fontSize: FONT_SIZES.XS,
    color: '#6b7280',
  },
  actions: {
    marginLeft: SPACING.SM,
  },
  actionButton: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.XS,
    color: '#6b7280',
  },
});
