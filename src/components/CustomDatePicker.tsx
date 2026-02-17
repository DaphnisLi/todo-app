import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';

interface CustomDatePickerProps {
  visible: boolean;
  value?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
}

export function CustomDatePicker({
  visible,
  value,
  onConfirm,
  onCancel,
  minimumDate = new Date(),
}: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [selectedHour, setSelectedHour] = useState(value?.getHours() || 12);
  const [selectedMinute, setSelectedMinute] = useState(value?.getMinutes() || 0);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setSelectedHour(value.getHours());
      setSelectedMinute(value.getMinutes());
    }
  }, [value]);

  const handleConfirm = () => {
    const newDate = new Date(selectedDate);
    newDate.setHours(selectedHour);
    newDate.setMinutes(selectedMinute);
    newDate.setSeconds(0);
    onConfirm(newDate);
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // 本月1号
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // 本月最后一天
    
    // 如果今天不是本月第一天，从今天开始显示
    const displayStart = today.getDate() === 1 ? startDate : today;
    
    for (let i = 0; i <= 31; i++) {
      const currentDate = new Date(displayStart);
      currentDate.setDate(displayStart.getDate() + i);
      
      if (currentDate <= endDate && currentDate >= minimumDate) {
        dates.push(currentDate);
      }
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      });
    }
  };

  const renderDatePicker = () => {
    const dates = generateDates();
    
    return (
      <View style={styles.datePickerContainer}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>
            {selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
          </Text>
        </View>
        
        <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.datesGrid}>
            {dates.map((date: Date, index: number) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateItem,
                    isSelected && styles.selectedDateItem,
                    isToday && !isSelected && styles.todayDateItem,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[
                    styles.dateDay,
                    isSelected && styles.selectedDateDay,
                    isToday && !isSelected && styles.todayDateDay,
                  ]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderTimePicker = () => {
  // 生成小时选项 - 当前时间前后各2个
  const generateHourOptions = () => {
    const hours = [];
    const currentHour = selectedHour;
    
    // 添加前2个小时
    for (let i = 2; i >= 1; i--) {
      const hour = currentHour - i;
      if (hour >= 0) hours.push(hour);
    }
    
    // 添加当前小时
    hours.push(currentHour);
    
    // 添加后2个小时
    for (let i = 1; i <= 2; i++) {
      const hour = currentHour + i;
      if (hour <= 23) hours.push(hour);
    }
    
    return hours;
  };

  // 生成分钟选项 - 每10分钟一个，最多5个
  const generateMinuteOptions = () => {
    const minutes = [];
    const currentMinute = selectedMinute;
    
    // 找到最接近的10分钟
    const roundedMinute = Math.round(currentMinute / 10) * 10;
    
    // 添加前2个10分钟间隔
    for (let i = 2; i >= 1; i--) {
      const minute = roundedMinute - (i * 10);
      if (minute >= 0) minutes.push(minute);
    }
    
    // 添加当前间隔
    minutes.push(roundedMinute);
    
    // 添加后2个10分钟间隔
    for (let i = 1; i <= 2; i++) {
      const minute = roundedMinute + (i * 10);
      if (minute <= 50) minutes.push(minute);
    }
    
    return minutes;
  };

  const hours = generateHourOptions();
  const minutes = generateMinuteOptions();

    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.timeHeader}>
          <Text style={styles.timeHeaderText}>时间</Text>
        </View>
        
        <View style={styles.timeContent}>
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>小时</Text>
            <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
              {hours.map(hour => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.timeItem,
                    hour === selectedHour && styles.selectedTimeItem,
                  ]}
                  onPress={() => setSelectedHour(hour)}
                >
                  <Text style={[
                    styles.timeText,
                    hour === selectedHour && styles.selectedTimeText,
                  ]}>
                    {hour.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>分钟</Text>
            <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
              {minutes.map(minute => (
                <TouchableOpacity
                  key={minute}
                  style={[
                    styles.timeItem,
                    minute === selectedMinute && styles.selectedTimeItem,
                  ]}
                  onPress={() => setSelectedMinute(minute)}
                >
                  <Text style={[
                    styles.timeText,
                    minute === selectedMinute && styles.selectedTimeText,
                  ]}>
                    {minute.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>选择日期和时间</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>

          {/* 当前选择显示 */}
          <View style={styles.currentSelection}>
            <Text style={styles.currentSelectionText}>
              {selectedDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })} {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </Text>
          </View>

          {/* 日期和时间选择器 */}
          <View style={styles.pickerContainer}>
            {renderDatePicker()}
            {renderTimePicker()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
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
  confirmButton: {
    padding: SPACING.SM,
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.MD,
    color: '#3b82f6',
    fontWeight: '500',
  },
  currentSelection: {
    padding: SPACING.MD,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  currentSelectionText: {
    fontSize: FONT_SIZES.MD,
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '500',
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  datePickerContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  dateHeader: {
    padding: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateHeaderText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  dateScroll: {
    flex: 1,
  },
  timePickerContainer: {
    flex: 1,
  },
  timeHeader: {
    padding: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timeHeaderText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  timeContent: {
    flex: 1,
    flexDirection: 'row',
  },
  timeSection: {
    flex: 1,
    alignItems: 'center',
  },
  monthSection: {
    padding: SPACING.XS,
  },
  monthLabel: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: SPACING.XS,
    marginLeft: SPACING.XS,
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.SM,
  },
  dateItem: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 6,
  },
  selectedDateItem: {
    backgroundColor: '#3b82f6',
  },
  todayDateItem: {
    backgroundColor: '#fef3c7',
  },
  dateDay: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '500',
    color: '#1f2937',
  },
  selectedDateDay: {
    color: '#ffffff',
  },
  todayDateDay: {
    color: '#92400e',
  },
  dateWeekday: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 1,
  },
  selectedDateWeekday: {
    color: '#ffffff',
  },
  todayDateWeekday: {
    color: '#92400e',
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: SPACING.XS,
  },
  timeScroll: {
    flex: 1,
    width: '100%',
  },
  timeItem: {
    paddingVertical: SPACING.XS,
    alignItems: 'center',
  },
  selectedTimeItem: {
    backgroundColor: '#3b82f6',
  },
  timeText: {
    fontSize: FONT_SIZES.SM,
    color: '#1f2937',
  },
  selectedTimeText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});
