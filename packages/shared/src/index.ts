// ═══════════════════════════════════════════
//  Shared types for Pinuyumayan platform
// ═══════════════════════════════════════════

// ── User ──
export type UserRole = 'admin' | 'editor' | 'user';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  tribeId: number | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ── Tribe ──
export interface Tribe {
  id: number;
  name: string;
  traditionalName: string | null;
  region: string | null;
  description: string | null;
  history: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImage: string | null;
  population: number | null;
}

// ── Article ──
export type ArticleCategory = '文化' | '部落' | '歷史' | '音樂' | '工藝' | '信仰' | '語言' | '教育';

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: ArticleCategory;
  tags: string | null;
  published: boolean;
  views: number;
  authorId: number | null;
  createdAt: string;
  updatedAt: string;
  // joined fields
  authorName?: string;
  authorAvatar?: string;
}

// ── Vocabulary ──
export type VocabCategory = '問候' | '親屬' | '自然' | '數字' | '食物' | '動物' | '文化' | '日常' | '身體';

export interface VocabWord {
  id: number;
  puyumaWord: string;
  chineseMeaning: string;
  englishMeaning: string | null;
  pronunciation: string | null;
  exampleSentence: string | null;
  exampleChinese: string | null;
  category: VocabCategory;
  audioUrl: string | null;
}

// ── Event ──
export type EventType = '祭典' | '活動' | '工作坊' | '展覽' | '其他';

export interface Event {
  id: number;
  title: string;
  description: string | null;
  type: EventType;
  location: string | null;
  startDate: string;
  endDate: string | null;
  tribeId: number | null;
  coverImage: string | null;
  createdAt: string;
  tribeName?: string;
}

// ── Media ──
export type MediaType = 'photo' | 'video' | 'audio';

export interface Media {
  id: number;
  title: string;
  description: string | null;
  type: MediaType;
  url: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

// ── Notification ──
export type NotificationType = 'comment' | 'like' | 'follow' | 'article' | 'system';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

// ── Pagination ──
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ── API responses ──
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}
