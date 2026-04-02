import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, sql, desc, count, and, gte, ilike, or } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { users, comments, articles, tribes, vocabulary, events, media, bookmarks, likes, tribeFollows, notifications, auditLogs, featureFlags, triggers, agents, agentLogs, revenueRecords, mapMarkers, loginHistory, discussions, culturalSites } from '../database/schema';
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

  // ── Audit log (persisted in DB) ──
  async logAction(userId: number, action: string, target: string, detail?: string) {
    try {
      await this.db.insert(auditLogs).values({ userId, action, target, detail });
    } catch { /* non-critical */ }
  }

  async getAuditLogs(page = 1, limit = 50, action?: string, userId?: number) {
    const offset = (page - 1) * limit;
    const conditions: any[] = [];
    if (action) conditions.push(eq(auditLogs.action, action));
    if (userId) conditions.push(eq(auditLogs.userId, userId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [{ total }] = await this.db.select({ total: sql<number>`count(*)` }).from(auditLogs).where(where);
    const logs = await this.db.select({ id: auditLogs.id, userId: auditLogs.userId, action: auditLogs.action, target: auditLogs.target, detail: auditLogs.detail, createdAt: auditLogs.createdAt, userName: users.name })
      .from(auditLogs).leftJoin(users, eq(auditLogs.userId, users.id)).where(where)
      .orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
    // Unique actions for filter
    const actions = await this.db.selectDistinct({ action: auditLogs.action }).from(auditLogs);
    return {
      logs: logs.map(l => ({ ...l, timestamp: l.createdAt.toISOString() })),
      actions: actions.map(a => a.action),
      pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
    };
  }

  // ═══════════════════════════════════════════
  //  Feature Flags (Phase 10 — DB-persisted)
  // ═══════════════════════════════════════════
  async getFeatureFlags() {
    const flags = await this.db.select().from(featureFlags).orderBy(desc(featureFlags.updatedAt));
    return { flags };
  }
  async toggleFeatureFlag(id: number) {
    const [f] = await this.db.select().from(featureFlags).where(eq(featureFlags.id, id));
    if (!f) throw new NotFoundException();
    await this.db.update(featureFlags).set({ enabled: !f.enabled, updatedAt: new Date() }).where(eq(featureFlags.id, id));
    const [updated] = await this.db.select().from(featureFlags).where(eq(featureFlags.id, id));
    return { flag: updated };
  }
  async createFeatureFlag(data: any) {
    const [f] = await this.db.insert(featureFlags).values(data).returning();
    return { flag: f };
  }
  async deleteFeatureFlag(id: number) {
    await this.db.delete(featureFlags).where(eq(featureFlags.id, id));
    return { success: true };
  }

  // ═══════════════════════════════════════════
  //  Triggers (Phase 10)
  // ═══════════════════════════════════════════
  async getTriggers() {
    const rows = await this.db.select().from(triggers).orderBy(desc(triggers.updatedAt));
    return { triggers: rows };
  }
  async createTrigger(data: any, userId: number) {
    const [t] = await this.db.insert(triggers).values({ ...data, createdBy: userId }).returning();
    return { trigger: t };
  }
  async updateTrigger(id: number, data: any) {
    await this.db.update(triggers).set({ ...data, updatedAt: new Date() }).where(eq(triggers.id, id));
    const [t] = await this.db.select().from(triggers).where(eq(triggers.id, id));
    return { trigger: t };
  }
  async deleteTrigger(id: number) {
    await this.db.delete(triggers).where(eq(triggers.id, id));
    return { success: true };
  }

  // ═══════════════════════════════════════════
  //  AI Agents (Phase 10)
  // ═══════════════════════════════════════════
  async getAgents() {
    const rows = await this.db.select().from(agents).orderBy(desc(agents.updatedAt));
    return { agents: rows };
  }
  async getAgentLogs(agentId: number, page = 1) {
    const limit = 20; const offset = (page - 1) * limit;
    const [{ total }] = await this.db.select({ total: sql<number>`count(*)` }).from(agentLogs).where(eq(agentLogs.agentId, agentId));
    const rows = await this.db.select().from(agentLogs).where(eq(agentLogs.agentId, agentId)).orderBy(desc(agentLogs.createdAt)).limit(limit).offset(offset);
    return { logs: rows, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } };
  }
  async updateAgent(id: number, data: any) {
    await this.db.update(agents).set({ ...data, updatedAt: new Date() }).where(eq(agents.id, id));
    const [a] = await this.db.select().from(agents).where(eq(agents.id, id));
    return { agent: a };
  }
  async createAgent(data: any, userId: number) {
    const [a] = await this.db.insert(agents).values({ ...data, createdBy: userId }).returning();
    return { agent: a };
  }
  async deleteAgent(id: number) {
    await this.db.delete(agents).where(eq(agents.id, id));
    return { success: true };
  }

  // ═══════════════════════════════════════════
  //  Revenue Records (Phase 10)
  // ═══════════════════════════════════════════
  async getRevenue(page = 1) {
    const limit = 20; const offset = (page - 1) * limit;
    const [{ total }] = await this.db.select({ total: sql<number>`count(*)` }).from(revenueRecords);
    const rows = await this.db.select().from(revenueRecords).orderBy(desc(revenueRecords.createdAt)).limit(limit).offset(offset);
    // Summary
    const all = await this.db.select({ type: revenueRecords.type, amount: revenueRecords.amount, status: revenueRecords.status }).from(revenueRecords);
    const totalAmount = all.filter(r => r.status === 'completed').reduce((s, r) => s + r.amount, 0);
    const byType: Record<string, number> = {};
    all.filter(r => r.status === 'completed').forEach(r => { byType[r.type] = (byType[r.type] || 0) + r.amount; });
    return { records: rows, summary: { totalAmount, byType, count: all.length }, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } };
  }
  async createRevenue(data: any, userId: number) {
    const [r] = await this.db.insert(revenueRecords).values({ ...data, createdBy: userId }).returning();
    return { record: r };
  }
  async deleteRevenue(id: number) {
    await this.db.delete(revenueRecords).where(eq(revenueRecords.id, id));
    return { success: true };
  }

  // ═══════════════════════════════════════════
  //  Map Markers (Phase 10)
  // ═══════════════════════════════════════════
  async getMapMarkers() {
    const rows = await this.db.select().from(mapMarkers).orderBy(desc(mapMarkers.updatedAt));
    return { markers: rows };
  }
  async createMapMarker(data: any, userId: number) {
    const [m] = await this.db.insert(mapMarkers).values({ ...data, createdBy: userId }).returning();
    return { marker: m };
  }
  async updateMapMarker(id: number, data: any) {
    await this.db.update(mapMarkers).set({ ...data, updatedAt: new Date() }).where(eq(mapMarkers.id, id));
    const [m] = await this.db.select().from(mapMarkers).where(eq(mapMarkers.id, id));
    return { marker: m };
  }
  async deleteMapMarker(id: number) {
    await this.db.delete(mapMarkers).where(eq(mapMarkers.id, id));
    return { success: true };
  }

  // ═══════════════════════════════════════════
  //  Login History (Phase 10)
  // ═══════════════════════════════════════════
  async getLoginHistory(page = 1, userId?: number) {
    const limit = 30; const offset = (page - 1) * limit;
    const where = userId ? eq(loginHistory.userId, userId) : undefined;
    const [{ total }] = await this.db.select({ total: sql<number>`count(*)` }).from(loginHistory).where(where);
    const rows = await this.db.select({ id: loginHistory.id, userId: loginHistory.userId, ip: loginHistory.ip, userAgent: loginHistory.userAgent, success: loginHistory.success, createdAt: loginHistory.createdAt, userName: users.name })
      .from(loginHistory).leftJoin(users, eq(loginHistory.userId, users.id)).where(where).orderBy(desc(loginHistory.createdAt)).limit(limit).offset(offset);
    return { logs: rows, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } };
  }
  async recordLogin(userId: number, ip: string, userAgent: string, success: boolean) {
    await this.db.insert(loginHistory).values({ userId, ip, userAgent, success });
  }

  // ═══════════════════════════════════════════
  //  Discussions management (Phase 10 — admin upgrade)
  // ═══════════════════════════════════════════
  async getDiscussionsAdmin(page = 1) {
    const limit = 30; const offset = (page - 1) * limit;
    const [{ total }] = await this.db.select({ total: sql<number>`count(*)` }).from(discussions);
    const rows = await this.db.select().from(discussions).orderBy(desc(discussions.createdAt)).limit(limit).offset(offset);
    return { discussions: rows, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } };
  }
  async deleteDiscussion(id: number) {
    await this.db.delete(discussions).where(eq(discussions.id, id));
    return { success: true };
  }

  // ═══════════════════════════════════════════
  //  Cultural Sites management (Phase 10 — admin upgrade)
  // ═══════════════════════════════════════════
  async getCulturalSitesAdmin() {
    const rows = await this.db.select().from(culturalSites).orderBy(desc(culturalSites.createdAt));
    return { sites: rows };
  }
  async createCulturalSite(data: any) {
    const [s] = await this.db.insert(culturalSites).values(data).returning();
    return { site: s };
  }
  async updateCulturalSite(id: number, data: any) {
    await this.db.update(culturalSites).set(data).where(eq(culturalSites.id, id));
    const [s] = await this.db.select().from(culturalSites).where(eq(culturalSites.id, id));
    return { site: s };
  }
  async deleteCulturalSite(id: number) {
    await this.db.delete(culturalSites).where(eq(culturalSites.id, id));
    return { success: true };
  }

  // ═══════════════════════════════════════════
  //  User detail + ban/unban (Phase 10)
  // ═══════════════════════════════════════════
  async getUserDetail(id: number) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    if (!user) throw new NotFoundException();
    const [{ articleCount }] = await this.db.select({ articleCount: sql<number>`count(*)` }).from(articles).where(eq(articles.authorId, id));
    const [{ commentCount }] = await this.db.select({ commentCount: sql<number>`count(*)` }).from(comments).where(eq(comments.userId, id));
    const logins = await this.db.select().from(loginHistory).where(eq(loginHistory.userId, id)).orderBy(desc(loginHistory.createdAt)).limit(5);
    return { user: { ...user, password: undefined }, stats: { articles: Number(articleCount), comments: Number(commentCount) }, recentLogins: logins };
  }

  // ═══════════════════════════════════════════
  //  System monitoring real data (Phase 10)
  // ═══════════════════════════════════════════
  async getSystemMetrics() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const [[usersToday],[articlesToday],[commentsToday],[loginsToday],[auditToday]] = await Promise.all([
      this.db.select({c: sql<number>`count(*)`}).from(users).where(gte(users.createdAt, todayStart)),
      this.db.select({c: sql<number>`count(*)`}).from(articles).where(gte(articles.createdAt, todayStart)),
      this.db.select({c: sql<number>`count(*)`}).from(comments).where(gte(comments.createdAt, todayStart)),
      this.db.select({c: sql<number>`count(*)`}).from(loginHistory).where(gte(loginHistory.createdAt, todayStart)),
      this.db.select({c: sql<number>`count(*)`}).from(auditLogs).where(gte(auditLogs.createdAt, todayStart)),
    ]);
    const stats = await this.getStats();
    return {
      stats,
      today: { users: Number(usersToday.c), articles: Number(articlesToday.c), comments: Number(commentsToday.c), logins: Number(loginsToday.c), auditActions: Number(auditToday.c) },
      dbTables: 29,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  // ── Site Settings (JSON-based, stored in site_settings table) ──
  async getSiteSettings() {
    try {
      const rows = await this.db.execute(sql`SELECT key, value FROM site_settings`);
      const saved: Record<string, any> = {};
      for (const row of rows as any[]) {
        try { saved[row.key] = JSON.parse(row.value); } catch { saved[row.key] = row.value; }
      }
      // Merge defaults with saved — saved values override defaults
      const defaults = this.getDefaultSiteSettings();
      return { settings: { ...defaults, ...saved } };
    } catch {
      // Table may not exist yet — return defaults
      return { settings: this.getDefaultSiteSettings() };
    }
  }

  async updateSiteSettings(body: Record<string, any>) {
    // Ensure table exists
    await this.db.execute(sql`CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT NOW())`);
    for (const [key, value] of Object.entries(body)) {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.db.execute(sql`INSERT INTO site_settings (key, value, updated_at) VALUES (${key}, ${jsonValue}, NOW()) ON CONFLICT (key) DO UPDATE SET value = ${jsonValue}, updated_at = NOW()`);
    }
    return this.getSiteSettings();
  }

  private getDefaultSiteSettings() {
    return {
      heroSlides: [
        { id: "h1", title: "Pinuyumayan", subtitle: "卑南族入口網", description: "探索卑南族豐富的文化遺產 — 從部落歷史、傳統祭儀，到族語學習與文化藝術，一起守護這份珍貴的文化寶藏。", buttonText: "探索部落 →", buttonLink: "/tribes", bgColor: "var(--cream)" },
        { id: "h2", title: "族語學習", subtitle: "Puyuma Language", description: "學習卑南語，讓珍貴的母語代代相傳。提供詞彙庫、每日一詞與互動測驗。", buttonText: "開始學習 →", buttonLink: "/language", bgColor: "var(--bg-2)" },
        { id: "h3", title: "文化祭典", subtitle: "Cultural Events", description: "大獵祭、海祭等傳統祭典是卑南族最重要的文化傳承活動。", buttonText: "查看活動 →", buttonLink: "/events", bgColor: "var(--bg-3)" },
      ],
      // Homepage section layout — order & visibility
      homeSections: [
        { id: "hero", label: "主視覺輪播", enabled: true },
        { id: "daily", label: "每日一詞", enabled: true },
        { id: "stats", label: "統計數字", enabled: true },
        { id: "tribes", label: "卑南八社", enabled: true },
        { id: "sites", label: "文化景點", enabled: true },
        { id: "articles", label: "文化誌", enabled: true },
        { id: "vocab", label: "族語學習 + 排行榜", enabled: true },
        { id: "events", label: "活動祭典", enabled: true },
        { id: "cta", label: "行動呼籲", enabled: true },
      ],
      headerBrand: "Pinuyumayan",
      headerNav: [
        { href: "/", label: "首頁" },
        { href: "/tribes", label: "部落" },
        { href: "/articles", label: "文化誌" },
        { href: "/language", label: "族語" },
        { href: "/events", label: "活動" },
        { href: "/cultural-sites", label: "景點" },
        { href: "/community", label: "社群" },
        { href: "/media", label: "媒體" },
      ],
      footerBrand: "Pinuyumayan",
      footerDescription: "卑南族文化入口網 — 保存與推廣卑南族語言、文化與傳統知識的數位平台。致力於以數位科技連結傳統智慧。",
      footerCtaTitle: "開始探索卑南族文化",
      footerCtaSubtitle: "學習族語、認識部落、參與文化活動",
      footerCtaButtonText: "免費加入",
      footerCtaButtonLink: "/register",
      footerLinks: {
        explore: [
          { href: "/tribes", label: "部落巡禮" },
          { href: "/tribes/map", label: "部落地圖" },
          { href: "/articles", label: "文化誌" },
          { href: "/events", label: "活動祭典" },
          { href: "/cultural-sites", label: "文化景點" },
        ],
        learn: [
          { href: "/language", label: "族語詞彙" },
          { href: "/language/quiz", label: "族語測驗" },
          { href: "/media", label: "媒體庫" },
          { href: "/community", label: "討論區" },
          { href: "/search", label: "搜尋" },
        ],
        account: [
          { href: "/login", label: "登入" },
          { href: "/register", label: "註冊" },
          { href: "/profile", label: "個人檔案" },
          { href: "/about", label: "關於平台" },
        ],
      },
    };
  }
}
