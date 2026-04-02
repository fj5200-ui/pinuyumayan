import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { users, articles, vocabulary, events, tribes } from '../database/schema';
import { desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

@Injectable()
export class ExportsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  private toCsv(rows: any[]): string {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];
    rows.forEach(r => { lines.push(headers.map(h => { const v = r[h]; return typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n')) ? `"${v.replace(/"/g, '""')}"` : String(v ?? ''); }).join(',')); });
    return lines.join('\n');
  }

  async exportUsers() {
    const rows = await this.db.select({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt));
    return this.toCsv(rows);
  }

  async exportArticles() {
    const rows = await this.db.select({ id: articles.id, title: articles.title, slug: articles.slug, category: articles.category, views: articles.views, published: articles.published, createdAt: articles.createdAt }).from(articles).orderBy(desc(articles.createdAt));
    return this.toCsv(rows);
  }

  async exportVocabulary() {
    const rows = await this.db.select({ id: vocabulary.id, puyumaWord: vocabulary.puyumaWord, chineseMeaning: vocabulary.chineseMeaning, englishMeaning: vocabulary.englishMeaning, category: vocabulary.category, pronunciation: vocabulary.pronunciation }).from(vocabulary);
    return this.toCsv(rows);
  }

  async exportEvents() {
    const rows = await this.db.select({ id: events.id, title: events.title, type: events.type, location: events.location, startDate: events.startDate, endDate: events.endDate }).from(events);
    return this.toCsv(rows);
  }

  async exportTribes() {
    const rows = await this.db.select({ id: tribes.id, name: tribes.name, traditionalName: tribes.traditionalName, region: tribes.region, population: tribes.population, latitude: tribes.latitude, longitude: tribes.longitude }).from(tribes);
    return this.toCsv(rows);
  }
}
