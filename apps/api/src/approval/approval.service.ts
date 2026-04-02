import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc, sql, and, count } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { approvalItems } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

@Injectable()
export class ApprovalService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async getQueue(status?: string, type?: string, page = 1) {
    const limit = 20;
    const offset = (page - 1) * limit;
    const conditions: any[] = [];
    if (status) conditions.push(eq(approvalItems.status, status as any));
    if (type) conditions.push(eq(approvalItems.type, type as any));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(approvalItems).where(where);
    const items = await this.db.select().from(approvalItems).where(where)
      .orderBy(desc(approvalItems.createdAt)).limit(limit).offset(offset);

    // Stats
    const [{ pending }] = await this.db.select({ pending: count() }).from(approvalItems).where(eq(approvalItems.status, 'pending'));
    const [{ approved }] = await this.db.select({ approved: count() }).from(approvalItems).where(eq(approvalItems.status, 'approved'));
    const [{ rejected }] = await this.db.select({ rejected: count() }).from(approvalItems).where(eq(approvalItems.status, 'rejected'));

    return {
      items,
      pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
      stats: { pending: Number(pending), approved: Number(approved), rejected: Number(rejected) },
    };
  }

  async approve(id: number, reviewedBy: string, note?: string) {
    const [item] = await this.db.select().from(approvalItems).where(eq(approvalItems.id, id));
    if (!item) throw new NotFoundException('找不到審核項目');
    await this.db.update(approvalItems).set({
      status: 'approved', reviewedBy, reviewNote: note || null, reviewedAt: new Date(),
    }).where(eq(approvalItems.id, id));
    const [updated] = await this.db.select().from(approvalItems).where(eq(approvalItems.id, id));
    return { item: updated };
  }

  async reject(id: number, reviewedBy: string, note?: string) {
    const [item] = await this.db.select().from(approvalItems).where(eq(approvalItems.id, id));
    if (!item) throw new NotFoundException('找不到審核項目');
    await this.db.update(approvalItems).set({
      status: 'rejected', reviewedBy, reviewNote: note || null, reviewedAt: new Date(),
    }).where(eq(approvalItems.id, id));
    const [updated] = await this.db.select().from(approvalItems).where(eq(approvalItems.id, id));
    return { item: updated };
  }

  async submit(type: string, title: string, content: string, userId: number, userName: string) {
    const [item] = await this.db.insert(approvalItems).values({
      type: type as any, title, content, submittedBy: userName, submittedById: userId, status: 'pending',
    }).returning();
    return { item };
  }
}
