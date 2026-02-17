import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { Category, CategoryColor } from '../types';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { getCategoryColor } from '../constants/colors';

const CATEGORY_COLORS: CategoryColor[] = [
  'black', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'cyan', 'teal'
];

const COLOR_DISPLAY: Record<CategoryColor, string> = {
  black: '#000000',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  gray: '#6b7280',
};

interface CategoryManagerProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  onUpdateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  currentIdentityId: string;
}

export function CategoryManager({
  visible,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  currentIdentityId,
}: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState<CategoryColor>('black');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('错误', '请输入分类名称');
      return;
    }

    if (categories.some(cat => cat.name === newCategoryName.trim())) {
      Alert.alert('错误', '分类名称已存在');
      return;
    }

    try {
      await onAddCategory({
        name: newCategoryName.trim(),
        color: selectedColor,
        identityId: currentIdentityId,
      });
      setNewCategoryName('');
      setSelectedColor('black');
      Alert.alert('成功', '分类添加成功');
    } catch (error) {
      Alert.alert('错误', '添加分类失败');
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View
          style={[
            styles.categoryColor,
            { backgroundColor: getCategoryColor(item.color) },
          ]}
        />
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            Alert.alert(
              '编辑分类',
              `编辑分类"${item.name}"`,
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '确定',
                  onPress: () => {
                    console.log('编辑分类:', item);
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.editButtonText}>编辑</Text>
        </TouchableOpacity>
          
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              '确认删除',
              `确定要删除分类"${item.name}"吗？`,
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '删除',
                  style: 'destructive',
                  onPress: () => onDeleteCategory(item.id),
                },
              ]
            );
          }}
        >
          <Text style={styles.deleteButtonText}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderColorOption = (color: CategoryColor) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.colorOption,
        selectedColor === color && styles.selectedColorOption,
      ]}
      onPress={() => setSelectedColor(color)}
    >
      <View
        style={[
          styles.colorDot,
          { backgroundColor: COLOR_DISPLAY[color] },
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>管理分类</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addCategorySection}>
          <Text style={styles.sectionTitle}>添加新分类</Text>
          <View style={styles.addCategoryForm}>
            <TextInput
              style={styles.categoryInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="分类名称"
              placeholderTextColor="#9ca3af"
            />
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.colorPicker}
            >
              {CATEGORY_COLORS.map(renderColorOption)}
            </ScrollView>
          </View>
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
            <Text style={styles.addButtonText}>添加</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryListSection}>
          <Text style={styles.sectionTitle}>
            已有分类 ({categories.length})
          </Text>
          
          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无分类</Text>
              <Text style={styles.emptyDescription}>
                点击上方添加按钮创建第一个分类
              </Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          )}
        </View>
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FONT_SIZES.LG,
    color: '#6b7280',
    fontWeight: '600',
  },
  addCategorySection: {
    padding: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: SPACING.SM,
  },
  addCategoryForm: {
    gap: SPACING.SM,
  },
  categoryInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    fontSize: FONT_SIZES.MD,
    color: '#1f2937',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: SPACING.XS,
  },
  colorOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XS,
  },
  selectedColorOption: {
    transform: [{ scale: 1.1 }],
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: BORDER_RADIUS,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
  categoryListSection: {
    flex: 1,
    padding: SPACING.MD,
  },
  categoryList: {
    gap: SPACING.SM,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.SM,
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS,
    marginBottom: SPACING.SM,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.SM,
  },
  categoryName: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: SPACING.XS,
  },
  editButton: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: '#f3f4f6',
    borderRadius: BORDER_RADIUS / 2,
  },
  editButtonText: {
    fontSize: FONT_SIZES.SM,
    color: '#1f2937',
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: '#fef2f2',
    borderRadius: BORDER_RADIUS / 2,
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.SM,
    color: '#991b1b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: '#9ca3af',
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
