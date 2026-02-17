export interface Todo {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  priority: Priority;
  dueDate?: Date;
  isCompleted: boolean;
  attachments: Attachment[];
  reminders: Reminder[];
  repeatRule?: RepeatRule;
  identityId: string;
  assigneeId?: string;
  status: TodoStatus;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  color: CategoryColor;
  identityId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Identity {
  id: string;
  name: string;
  avatar: string;
  isDefault: boolean;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  identityId: string;
}

export interface Attachment {
  id: string;
  name: string;
  uri: string;
  type: 'image' | 'document';
  size: number;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  todoId: string;
  time: Date;
  isEnabled: boolean;
  createdAt: Date;
}

export interface RepeatRule {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  isEnabled: boolean;
}

export interface Comment {
  id: string;
  todoId: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchHistory {
  id: string;
  query: string;
  createdAt: Date;
}

export interface FilterTemplate {
  id: string;
  name: string;
  filters: FilterOptions;
  createdAt: Date;
}

export interface FilterOptions {
  priority?: Priority[];
  categoryId?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  isCompleted?: boolean;
  identityId?: string;
  assigneeId?: string;
}

export type Priority = 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';

export type CategoryColor = 
  | 'red'
  | 'orange' 
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray'
  | 'black'
  | 'cyan'
  | 'teal';

export type TodoStatus = 'pending' | 'claimed' | 'in-progress' | 'completed';

export type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'completed' | 'title';

export type SortOrder = 'asc' | 'desc';

export type ViewMode = 'list' | 'timeline';

export interface AppState {
  currentIdentityId: string;
  viewMode: ViewMode;
  currentCategoryId?: string;
  sortBy: SortOption;
  sortOrder: SortOrder;
  searchQuery: string;
  filterOptions: FilterOptions;
}

export interface BackupData {
  version: string;
  timestamp: Date;
  todos: Todo[];
  categories: Category[];
  identities: Identity[];
  roles: Role[];
}
