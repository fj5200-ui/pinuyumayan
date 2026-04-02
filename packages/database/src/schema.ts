import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  uniqueIndex,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ═══════════════════════════════════════════
//  Enums
// ═══════════════════════════════════════════
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'user']);
export const eventTypeEnum = pgEnum('event_type', ['祭典', '活動', '工作坊', '展覽', '其他']);
export const mediaTypeEnum = pgEnum('media_type', ['photo', 'video', 'audio']);
export const articleCategoryEnum = pgEnum('article_category', [
  '文化', '部落', '歷史', '音樂', '工藝', '信仰', '語言', '教育',
]);
export const vocabCategoryEnum = pgEnum('vocab_category', [
  '問候', '親屬', '自然', '數字', '食物', '動物', '文化', '日常', '身體',
]);
export const notifTypeEnum = pgEnum('notif_type', ['comment', 'like', 'follow', 'article', 'system']);

// ═══════════════════════════════════════════
//  Users
// ═══════════════════════════════════════════
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  tribeId: integer('tribe_id').references(() => tribes.id, { onDelete: 'set null' }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_users_email').on(table.email),
]);

// ═══════════════════════════════════════════
//  Tribes (卑南八社)
// ═══════════════════════════════════════════
export const tribes = pgTable('tribes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  traditionalName: varchar('traditional_name', { length: 100 }),
  region: varchar('region', { length: 200 }),
  description: text('description'),
  history: text('history'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  coverImage: text('cover_image'),
  population: integer('population'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════
//  Articles (文化誌)
// ═══════════════════════════════════════════
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  category: articleCategoryEnum('category').default('文化').notNull(),
  tags: text('tags'), // JSON string array
  published: boolean('published').default(false).notNull(),
  views: integer('views').default(0).notNull(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_articles_slug').on(table.slug),
  index('idx_articles_category').on(table.category),
  index('idx_articles_author').on(table.authorId),
]);

// ═══════════════════════════════════════════
//  Vocabulary (族語詞彙)
// ═══════════════════════════════════════════
export const vocabulary = pgTable('vocabulary', {
  id: serial('id').primaryKey(),
  puyumaWord: varchar('puyuma_word', { length: 200 }).notNull(),
  chineseMeaning: varchar('chinese_meaning', { length: 200 }).notNull(),
  englishMeaning: varchar('english_meaning', { length: 200 }),
  pronunciation: varchar('pronunciation', { length: 200 }),
  exampleSentence: text('example_sentence'),
  exampleChinese: text('example_chinese'),
  category: vocabCategoryEnum('category').default('日常').notNull(),
  audioUrl: text('audio_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_vocab_category').on(table.category),
]);

// ═══════════════════════════════════════════
//  Events (活動祭典)
// ═══════════════════════════════════════════
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: eventTypeEnum('type').default('活動').notNull(),
  location: varchar('location', { length: 255 }),
  startDate: varchar('start_date', { length: 20 }).notNull(),
  endDate: varchar('end_date', { length: 20 }),
  tribeId: integer('tribe_id').references(() => tribes.id, { onDelete: 'set null' }),
  coverImage: text('cover_image'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════
//  Media (媒體庫)
// ═══════════════════════════════════════════
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: mediaTypeEnum('type').default('photo').notNull(),
  url: text('url'),
  thumbnailUrl: text('thumbnail_url'),
  uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════
//  Comments
// ═══════════════════════════════════════════
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_comments_article').on(table.articleId),
]);

// ═══════════════════════════════════════════
//  Likes
// ═══════════════════════════════════════════
export const likes = pgTable('likes', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_likes_unique').on(table.articleId, table.userId),
]);

// ═══════════════════════════════════════════
//  Bookmarks
// ═══════════════════════════════════════════
export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_bookmarks_unique').on(table.userId, table.articleId),
]);

// ═══════════════════════════════════════════
//  Tribe Follows
// ═══════════════════════════════════════════
export const tribeFollows = pgTable('tribe_follows', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tribeId: integer('tribe_id').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_follows_unique').on(table.userId, table.tribeId),
]);

// ═══════════════════════════════════════════
//  Notifications
// ═══════════════════════════════════════════
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: notifTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  link: text('link'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_notif_user').on(table.userId),
  index('idx_notif_unread').on(table.userId, table.read),
]);

// ═══════════════════════════════════════════
//  Discussions (社群討論)
// ═══════════════════════════════════════════
export const discussions = pgTable('discussions', {
  id: serial('id').primaryKey(),
  board: varchar('board', { length: 50 }).default('general').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  likes: integer('likes').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_discussions_board').on(table.board),
  index('idx_discussions_author').on(table.authorId),
]);

export const discussionReplies = pgTable('discussion_replies', {
  id: serial('id').primaryKey(),
  discussionId: integer('discussion_id').references(() => discussions.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_replies_discussion').on(table.discussionId),
]);

export const discussionLikes = pgTable('discussion_likes', {
  id: serial('id').primaryKey(),
  discussionId: integer('discussion_id').references(() => discussions.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_disc_likes_unique').on(table.discussionId, table.userId),
]);

// ═══════════════════════════════════════════
//  Cultural Sites (文化景點)
// ═══════════════════════════════════════════
export const culturalSiteTypeEnum = pgEnum('cultural_site_type', [
  '集會所', '祭祀場', '會所', '獵場', '文化區', '遺址', '工藝', '祭典場', '其他',
]);

export const culturalSites = pgTable('cultural_sites', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  type: culturalSiteTypeEnum('type').default('其他').notNull(),
  description: text('description'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  tribeId: integer('tribe_id').references(() => tribes.id, { onDelete: 'set null' }),
  tribeName: varchar('tribe_name', { length: 100 }),
  images: text('images'), // JSON string array
  tags: text('tags'), // JSON string array
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_sites_type').on(table.type),
  index('idx_sites_tribe').on(table.tribeId),
]);

// ═══════════════════════════════════════════
//  Event Registrations (活動報名)
// ═══════════════════════════════════════════
export const registrationStatusEnum = pgEnum('registration_status', ['pending', 'confirmed', 'cancelled']);

export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  userName: varchar('user_name', { length: 100 }).notNull(),
  status: registrationStatusEnum('status').default('pending').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_reg_unique').on(table.eventId, table.userId),
  index('idx_reg_event').on(table.eventId),
  index('idx_reg_user').on(table.userId),
]);

// ═══════════════════════════════════════════
//  Article Versions (文章版本歷史)
// ═══════════════════════════════════════════
export const articleVersions = pgTable('article_versions', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  version: integer('version').notNull(),
  editedBy: integer('edited_by').references(() => users.id, { onDelete: 'set null' }),
  editedByName: varchar('edited_by_name', { length: 100 }),
  changeNote: text('change_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_versions_article').on(table.articleId),
]);

// ═══════════════════════════════════════════
//  Relations
// ═══════════════════════════════════════════
export const usersRelations = relations(users, ({ one, many }) => ({
  tribe: one(tribes, { fields: [users.tribeId], references: [tribes.id] }),
  articles: many(articles),
  comments: many(comments),
  bookmarks: many(bookmarks),
  tribeFollows: many(tribeFollows),
  notifications: many(notifications),
}));

export const tribesRelations = relations(tribes, ({ many }) => ({
  users: many(users),
  events: many(events),
  followers: many(tribeFollows),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
  comments: many(comments),
  likes: many(likes),
  bookmarks: many(bookmarks),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  article: one(articles, { fields: [comments.articleId], references: [articles.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  article: one(articles, { fields: [likes.articleId], references: [articles.id] }),
  user: one(users, { fields: [likes.userId], references: [users.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  article: one(articles, { fields: [bookmarks.articleId], references: [articles.id] }),
}));

export const tribeFollowsRelations = relations(tribeFollows, ({ one }) => ({
  user: one(users, { fields: [tribeFollows.userId], references: [users.id] }),
  tribe: one(tribes, { fields: [tribeFollows.tribeId], references: [tribes.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  tribe: one(tribes, { fields: [events.tribeId], references: [tribes.id] }),
  creator: one(users, { fields: [events.createdBy], references: [users.id] }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [media.uploadedBy], references: [users.id] }),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  author: one(users, { fields: [discussions.authorId], references: [users.id] }),
  replies: many(discussionReplies),
  likesRecords: many(discussionLikes),
}));

export const discussionRepliesRelations = relations(discussionReplies, ({ one }) => ({
  discussion: one(discussions, { fields: [discussionReplies.discussionId], references: [discussions.id] }),
  author: one(users, { fields: [discussionReplies.authorId], references: [users.id] }),
}));

export const discussionLikesRelations = relations(discussionLikes, ({ one }) => ({
  discussion: one(discussions, { fields: [discussionLikes.discussionId], references: [discussions.id] }),
  user: one(users, { fields: [discussionLikes.userId], references: [users.id] }),
}));

export const culturalSitesRelations = relations(culturalSites, ({ one }) => ({
  tribe: one(tribes, { fields: [culturalSites.tribeId], references: [tribes.id] }),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, { fields: [eventRegistrations.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRegistrations.userId], references: [users.id] }),
}));

export const articleVersionsRelations = relations(articleVersions, ({ one }) => ({
  article: one(articles, { fields: [articleVersions.articleId], references: [articles.id] }),
  editor: one(users, { fields: [articleVersions.editedBy], references: [users.id] }),
}));
