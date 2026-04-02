import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { eq, and, ne, count } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { eventRegistrations } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

@Injectable()
export class RegistrationsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async register(eventId: number, userId: number, userName: string, note?: string) {
    // Check if already registered (non-cancelled)
    const [existing] = await this.db.select().from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId),
        ne(eventRegistrations.status, 'cancelled'),
      )).limit(1);

    if (existing) throw new ConflictException('您已報名此活動');

    const [reg] = await this.db.insert(eventRegistrations).values({
      eventId, userId, userName, note,
    }).returning();

    return { registration: reg };
  }

  async cancel(eventId: number, userId: number) {
    const [reg] = await this.db.select().from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId),
        ne(eventRegistrations.status, 'cancelled'),
      )).limit(1);

    if (!reg) throw new NotFoundException('找不到報名記錄');

    await this.db.update(eventRegistrations)
      .set({ status: 'cancelled' })
      .where(eq(eventRegistrations.id, reg.id));

    return { success: true };
  }

  async getByEvent(eventId: number) {
    const regs = await this.db.select().from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        ne(eventRegistrations.status, 'cancelled'),
      ));
    return { registrations: regs, count: regs.length };
  }

  async getByUser(userId: number) {
    const regs = await this.db.select().from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.userId, userId),
        ne(eventRegistrations.status, 'cancelled'),
      ));
    return { registrations: regs };
  }

  async checkRegistration(eventId: number, userId: number) {
    const [reg] = await this.db.select().from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId),
        ne(eventRegistrations.status, 'cancelled'),
      )).limit(1);
    return { registered: !!reg };
  }

  async confirm(id: number) {
    const [reg] = await this.db.select().from(eventRegistrations)
      .where(eq(eventRegistrations.id, id)).limit(1);
    if (!reg) throw new NotFoundException('找不到報名記錄');

    await this.db.update(eventRegistrations)
      .set({ status: 'confirmed' })
      .where(eq(eventRegistrations.id, id));

    return { success: true };
  }
}
