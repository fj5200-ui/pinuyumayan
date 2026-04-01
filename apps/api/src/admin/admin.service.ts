import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, sql, desc, count, and, gte, ilike, or } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { users, comments, articles, tribes, vocabulary, events, media, bookmarks, likes, tribeFollows, notifications } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';
@Injectable()
export class AdminService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  // ── Stats for homepage & dashboard ──
  async getStats() {
    const [[t], [a], [v], [e], [m], [u], [c]] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(tribes),
      this.db.select({ count: sql<number>`count(*)` }).from(articles),
      this.db.select({ count: sql<number>`count(*)` }).from(vocabulary),
      this.db.select({ count: sql<number>`count(*)` }).from(events),
      this.db.select({ count: sql<number>`count(*)` }).from(media),
      this.db.select({ count: sql<number>`count(*)` }).from(users),
      this.db.select({ count: sql<number>`count(*)` }).from(comments),
    ]);
    return {
      tribes: Number(t.count), articles: Number(a.count), vocabulary: Number(v.count),
      events: Number(e.count), media: Number(m.count), users: Number(u.count), comments: Number(c.count),
    };
  }

  // ── Dashboard analytics ──
  async getDashboard() {
    const stats = await this.getStats();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const [[newUsers], [newArticles], [newComments]] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
      this.db.select({ count: sql<number>`count(*)` }).from(articles).where(gte(articles.createdAt, sevenDaysAgo)),
      this.db.select({ count: sql<number>`count(*)` }).from(comments).where(gte(comments.createdAt, sevenDaysAgo)),
    ]);

    const recentArticles = await this.db.select({
      id: articles.id, title: articles.title, slug: articles.slug, views: articles.views,
      category: articles.category, published: articles.published, createdAt: articles.createdAt,
      authorName: users.name,
    }).from(articles).leftJoin(users, eq(articles.authorId, users.id)).orderBy(desc(articles.createdAt)).limit(5);

    const recentComments = await this.db.select({
      id: comments.id, content: comments.content, createdAt: comments.createdAt,
      authorName: users.name, articleTitle: articles.title,
    }).from(comments).leftJoin(users, eq(comments.userId, users.id)).leftJoin(articles, eq(comments.articleId, articles.id)).orderBy(desc(comments.createdAt)).limit(5);

    const topArticles = await this.db.select({
      id: articles.id, title: articles.title, slug: articles.slug, views: articles.views, category: articles.category,
    }).from(articles).orderBy(desc(articles.views)).limit(5);

    return {
      stats,
      recent: { newUsers: Number(newUsers.count), newArticles: Number(newArticles.count), newComments: Number(newComments.count) },
      recentArticles, recentComments, topArticles,
    };
  }

  // ── Users CRUD ──
  async getUsers(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const [c] = await this.db.select({ count: sql<number>`count(*)` }).from(users);
    const rows = await this.db.select({ id: users.id, email: users.email, name: users.name, role: users.role, tribeId: users.tribeId, avatarUrl: users.avatarUrl, bio: users.bio, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
    return { users: rows, pagination: { page, limit, total: Number(c.count), totalPages: Math.ceil(Number(c.count) / limit) } };
  }
  async updateRole(id: number, role: string) {
    await this.db.update(users).set({ role: role as any, updatedAt: new Date() }).where(eq(users.id, id));
    const [user] = await this.db.select({ id: users.id, email: users.email, name: users.name, role: users.role }).from(users).where(eq(users.id, id));
    return { user };
  }

  // ── Comments ──
  async getComments(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const [c] = await this.db.select({ count: sql<number>`count(*)` }).from(comments);
    const rows = await this.db.select({ id: comments.id, content: comments.content, createdAt: comments.createdAt, authorName: users.name, authorRole: users.role, articleTitle: articles.title, articleSlug: articles.slug })
      .from(comments).leftJoin(users, eq(comments.userId, users.id)).leftJoin(articles, eq(comments.articleId, articles.id)).orderBy(desc(comments.createdAt)).limit(limit).offset(offset);
    return { comments: rows, pagination: { page, limit, total: Number(c.count), totalPages: Math.ceil(Number(c.count) / limit) } };
  }
  async deleteComment(id: number) { await this.db.delete(comments).where(eq(comments.id, id)); return { success: true }; }

  // ── Tribes management ──
  async manageTribe(id: number | null, data: any) {
    if (id) {
      await this.db.update(tribes).set({ ...data, updatedAt: new Date() }).where(eq(tribes.id, id));
      const [t] = await this.db.select().from(tribes).where(eq(tribes.id, id));
      return { tribe: t };
    } else {
      const [t] = await this.db.insert(tribes).values(data).returning();
      return { tribe: t };
    }
  }
  async deleteTribe(id: number) { await this.db.delete(tribes).where(eq(tribes.id, id)); return { success: true }; }

  // ── Events management ──
  async manageEvent(id: number | null, data: any) {
    if (id) {
      await this.db.update(events).set({ ...data, updatedAt: new Date() }).where(eq(events.id, id));
      const [e] = await this.db.select().from(events).where(eq(events.id, id));
      return { event: e };
    } else {
      const [e] = await this.db.insert(events).values(data).returning();
      return { event: e };
    }
  }
  async deleteEvent(id: number) { await this.db.delete(events).where(eq(events.id, id)); return { success: true }; }

  // ── Media management ──
  async manageMedia(id: number | null, data: any) {
    if (id) {
      const [m] = await this.db.select().from(media).where(eq(media.id, id));
      if (!m) throw new NotFoundException();
      await this.db.update(media).set(data).where(eq(media.id, id));
      const [updated] = await this.db.select().from(media).where(eq(media.id, id));
      return { media: updated };
    } else {
      const [m] = await this.db.insert(media).values(data).returning();
      return { media: m };
    }
  }
  async deleteMedia(id: number) { await this.db.delete(media).where(eq(media.id, id)); return { success: true }; }

  // ── Vocabulary management ──
  async manageVocab(id: number | null, data: any) {
    if (id) {
      const [v] = await this.db.select().from(vocabulary).where(eq(vocabulary.id, id));
      if (!v) throw new NotFoundException();
      // vocabulary doesn't have updatedAt
      await this.db.update(vocabulary).set(data).where(eq(vocabulary.id, id));
      const [updated] = await this.db.select().from(vocabulary).where(eq(vocabulary.id, id));
      return { word: updated };
    } else {
      const [v] = await this.db.insert(vocabulary).values(data).returning();
      return { word: v };
    }
  }
  async deleteVocab(id: number) { await this.db.delete(vocabulary).where(eq(vocabulary.id, id)); return { success: true }; }

  // ── Audit log (stored in memory for now, can be persisted later) ──
  private auditLogs: any[] = [];
  logAction(userId: number, action: string, target: string, detail?: string) {
    this.auditLogs.unshift({ id: Date.now(), userId, action, target, detail, timestamp: new Date().toISOString() });
    if (this.auditLogs.length > 500) this.auditLogs = this.auditLogs.slice(0, 500);
  }
  getAuditLogs(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return {
      logs: this.auditLogs.slice(offset, offset + limit),
      pagination: { page, limit, total: this.auditLogs.length, totalPages: Math.ceil(this.auditLogs.length / limit) },
    };
  }
}
