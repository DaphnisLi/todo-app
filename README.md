# Todo App - 复杂待办事项管理应用

基于 Expo 54 + React Native + TypeScript 构建的复杂待办事项管理应用，支持多身份、分类、优先级、时间管理等高级功能。

## 功能特性

### 核心功能
- ✅ 待办事项的增删改查
- ✅ 优先级管理（4级优先级）
- ✅ 分类管理（自定义分类）
- ✅ 截止时间与提醒
- ✅ 重复待办规则
- ✅ 附件支持（图片/文档）
- ✅ 评论系统
- ✅ 搜索与筛选
- ✅ 拖拽排序

### 高级功能
- 👥 多身份管理
- 📁 分类系统
- ⏰ 时间管理
- 📊 统计分析
- 💾 本地存储
- 🔄 数据备份
- 📱 响应式设计

## 技术栈

- **框架**: Expo 54, React Native 0.75.4
- **语言**: TypeScript 5.3.3
- **状态管理**: React Hooks
- **存储**: AsyncStorage
- **UI**: React Native 原生组件
- **拖拽**: react-native-draggable-flatlist
- **时间**: date-fns
- **文件**: expo-file-system
- **通知**: expo-notifications

## 项目结构

```
todo-app/
├── src/
│   ├── components/     # 公共组件
│   │   ├── TodoItem.tsx
│   │   ├── TodoList.tsx
│   │   └── AddTodoModal.tsx
│   ├── hooks/         # 自定义Hook
│   │   ├── useTodos.ts
│   │   ├── useCategories.ts
│   │   ├── useIdentities.ts
│   │   └── useAppState.ts
│   ├── screens/        # 页面组件
│   │   └── HomeScreen.tsx
│   ├── storage/       # 本地存储
│   │   └── index.ts
│   ├── types/         # 类型定义
│   │   └── index.ts
│   ├── utils/         # 工具函数
│   │   └── index.ts
│   ├── constants/     # 常量配置
│   │   └── index.ts
│   └── App.tsx        # 应用入口
├── assets/            # 静态资源
├── package.json       # 依赖配置
├── tsconfig.json      # TypeScript配置
├── app.json          # Expo配置
└── babel.config.js   # Babel配置
```

## 安装与运行

### 环境要求
- Node.js 18+
- npm 或 yarn
- Expo CLI

### 安装依赖
```bash
npm install
```

### 运行应用
```bash
# 启动开发服务器
npm start

# 运行在iOS模拟器
npm run ios

# 运行在Android模拟器
npm run android

# 运行在Web浏览器
npm run web
```

## 核心功能说明

### 待办事项管理
- 支持标题、描述、优先级、分类、截止时间
- 附件上传（图片/文档，最大10MB）
- 评论系统
- 完成状态管理
- 拖拽排序

### 分类系统
- 自定义分类创建
- 黑白灰三色标识
- 分类筛选
- 待办事项分类转移

### 优先级管理
- 紧急重要（红色）
- 重要不紧急（橙色）
- 紧急不重要（蓝色）
- 不紧急不重要（灰色）

### 时间管理
- 截止时间设置
- 快捷日期选择（今天/明天/本周日）
- 过期提醒
- 重复规则设置

### 多身份管理
- 创建多个身份
- 身份切换
- 角色分配
- 待办事项归属

### 搜索与筛选
- 全局搜索
- 多条件筛选
- 搜索历史
- 筛选模板

## 数据存储

### 本地存储
- 使用 AsyncStorage 存储核心数据
- 文件缓存管理（最大30MB）
- 自动清理机制

### 备份功能
- JSON格式导出
- 数据导入
- 自动备份（保留3次）
- 合并模式支持

## 开发指南

### 代码规范
- TypeScript 严格模式
- ESLint 代码检查
- 组件化开发
- Hook 状态管理

### 样式规范
- 黑白灰配色方案
- 8px圆角设计
- 响应式布局
- 极简风格

### 性能优化
- 启动时间 < 3秒
- 页面切换 < 0.5秒
- 内存使用优化
- 缓存策略

## 构建发布

### 构建配置
```bash
# 构建Android
expo build:android

# 构建iOS
expo build:ios
```

### 发布配置
- 应用图标配置
- 启动画面设置
- 权限配置
- 版本管理

## 故障排除

### 常见问题
1. **依赖安装失败**: 清除缓存重新安装
2. **模拟器启动失败**: 检查模拟器配置
3. **类型错误**: 运行 TypeScript 检查
4. **存储问题**: 清除应用数据重试

### 调试技巧
- 使用 Expo 开发者工具
- 控制台日志查看
- 网络请求监控
- 性能分析

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 创建 Pull Request
5. 代码审查通过后合并

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 核心功能实现
- 基础UI界面
- 本地存储支持
