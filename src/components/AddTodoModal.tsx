import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Todo, Priority, Category } from '../types';
import { PRIORITIES, BORDER_RADIUS, SPACING, FONT_SIZES, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '../constants';
import { ValidationUtils } from '../utils';
import { CustomDatePicker } from './CustomDatePicker';
import { getCategoryColor } from '../constants/colors';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  categories: Category[];
  currentIdentityId: string;
  editingTodo?: Todo;
}

export function AddTodoModal({
  visible,
  onClose,
  onSave,
  categories,
  currentIdentityId,
  editingTodo,
}: AddTodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('not-urgent-not-important');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 当 editingTodo 变化时，更新表单状态
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title || '');
      setDescription(editingTodo.description || '');
      setPriority(editingTodo.priority || 'not-urgent-not-important');
      setSelectedCategory(editingTodo.categoryId || undefined);
      setDueDate(editingTodo.dueDate);
    } else {
      // 重置表单
      setTitle('');
      setDescription('');
      setPriority('not-urgent-not-important');
      setSelectedCategory(undefined);
      setDueDate(undefined);
    }
  }, [editingTodo]);

  const handleDateConfirm = (date: Date) => {
    setDueDate(date);
    setShowDatePicker(false);
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = () => {
    const titleValidation = ValidationUtils.validateTitle(title);
    if (!titleValidation.isValid) {
      Alert.alert('错误', titleValidation.error);
      return;
    }

    const descriptionValidation = ValidationUtils.validateDescription(description);
    if (!descriptionValidation.isValid) {
      Alert.alert('错误', descriptionValidation.error);
      return;
    }

    const todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      categoryId: selectedCategory,
      dueDate,
      isCompleted: false,
      attachments: [],
      reminders: [],
      identityId: currentIdentityId,
      status: 'pending',
      comments: [],
    };

    onSave(todoData);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPriority('not-urgent-not-important');
    setSelectedCategory(undefined);
    setDueDate(undefined);
    onClose();
  };

  const renderPriorityOption = (p: Priority) => (
    <TouchableOpacity
      key={p}
      style={[
        styles.priorityOption,
        priority === p && styles.selectedPriorityOption,
        { borderLeftColor: PRIORITIES[p].color },
      ]}
      onPress={() => setPriority(p)}
    >
      <Text
        style={[
          styles.priorityText,
          priority === p && styles.selectedPriorityText,
        ]}
      >
        {PRIORITIES[p].label}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryOption = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryOption,
        selectedCategory === category.id && styles.selectedCategoryOption,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <View
        style={[
          styles.categoryColor,
          { backgroundColor: getCategoryColor(category.color) },
        ]}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.selectedCategoryText,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingTodo ? '编辑待办' : '添加待办'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 标题 */}
          <View style={styles.section}>
            <Text style={styles.label}>标题 *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="输入待办事项标题"
              maxLength={MAX_TITLE_LENGTH}
              multiline
            />
            <Text style={styles.characterCount}>
              {title.length}/{MAX_TITLE_LENGTH}
            </Text>
          </View>

          {/* 描述 */}
          <View style={styles.section}>
            <Text style={styles.label}>描述</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="添加详细描述..."
              maxLength={MAX_DESCRIPTION_LENGTH}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </View>

          {/* 优先级 */}
          <View style={styles.section}>
            <Text style={styles.label}>优先级 *</Text>
            <View style={styles.priorityContainer}>
              {(Object.keys(PRIORITIES) as Priority[]).map(renderPriorityOption)}
            </View>
          </View>

          {/* 分类 */}
          <View style={styles.section}>
            <Text style={styles.label}>分类</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  !selectedCategory && styles.selectedCategoryOption,
                ]}
                onPress={() => setSelectedCategory(undefined)}
              >
                <View style={[styles.categoryColor, { backgroundColor: '#d1d5db' }]} />
                <Text
                  style={[
                    styles.categoryText,
                    !selectedCategory && styles.selectedCategoryText,
                  ]}
                >
                  未分类
                </Text>
              </TouchableOpacity>
              {categories.map(renderCategoryOption)}
            </ScrollView>
          </View>

          {/* 截止日期 */}
          <View style={styles.section}>
            <Text style={styles.label}>截止日期</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {dueDate ? formatDateDisplay(dueDate) : '选择日期和时间'}
              </Text>
              <Text style={styles.dateButtonIcon}>📅</Text>
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setDueDate(undefined)}
              >
                <Text style={styles.clearDateButtonText}>清除日期</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* 日期选择器 */}
        <CustomDatePicker
          visible={showDatePicker}
          value={dueDate}
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
          minimumDate={new Date()}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelButton: {
    padding: SPACING.SM,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.MD,
    color: '#6b7280',
  },
  saveButton: {
    padding: SPACING.SM,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.MD,
    color: '#3b82f6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: SPACING.MD,
  },
  section: {
    marginBottom: SPACING.LG,
  },
  label: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
    color: '#374151',
    marginBottom: SPACING.SM,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.SM,
    fontSize: FONT_SIZES.MD,
    color: '#1f2937',
    minHeight: 50,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.SM,
    fontSize: FONT_SIZES.SM,
    color: '#1f2937',
    minHeight: 100,
  },
  characterCount: {
    fontSize: FONT_SIZES.XS,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: SPACING.XS,
  },
  priorityContainer: {
    flexDirection: 'column',
    gap: SPACING.SM,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS,
    borderLeftWidth: 4,
    backgroundColor: '#f9fafb',
  },
  selectedPriorityOption: {
    backgroundColor: '#eff6ff',
  },
  priorityText: {
    fontSize: FONT_SIZES.SM,
    color: '#4b5563',
  },
  selectedPriorityText: {
    color: '#1d4ed8',
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.SM,
    marginRight: SPACING.SM,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#f9fafb',
  },
  selectedCategoryOption: {
    backgroundColor: '#eff6ff',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.SM,
  },
  categoryText: {
    fontSize: FONT_SIZES.SM,
    color: '#4b5563',
  },
  selectedCategoryText: {
    color: '#1d4ed8',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.SM,
    backgroundColor: '#f9fafb',
  },
  dateButtonText: {
    fontSize: FONT_SIZES.MD,
    color: '#1f2937',
  },
  dateButtonIcon: {
    fontSize: FONT_SIZES.MD,
  },
  clearDateButton: {
    marginTop: SPACING.SM,
    alignSelf: 'flex-start',
  },
  clearDateButtonText: {
    fontSize: FONT_SIZES.SM,
    color: '#ef4444',
  },
});
