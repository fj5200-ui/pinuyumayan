import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, desc, sql, and, count } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { discussions, discussionReplies, discussionLikes } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

@Injectable()
export class DiscussionsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async findAll(board?: string, page = 1) {
    const limit = 20;
    const offset = (page - 1) * limit;

    // Count total
    const whereClause = board && board !== 'all' ? eq(discussions.board, board) : undefined;
    const [{ total }] = await this.db.select({ total: count() }).from(discussions).where(whereClause);

    // Fetch discussions
    const rows = await this.db.select().from(discussions)
      .where(whereClause)
      .orderBy(desc(discussions.createdAt))
      .limit(limit).offset(offset);

    // Get reply counts for each discussion
    const items = await Promise.all(rows.map(async (d) => {
      const [{ cnt }] = await this.db.select({ cnt: count() }).from(discussionReplies)
        .where(eq(discussionReplies.discussionId, d.id));
      return { ...d, repliesCount: cnt, createdAt: d.createdAt.toISOString().split('T')[0] };
    }));

    return {
      discussions: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const [d] = await this.db.select().from(discussions).where(eq(discussions.id, id)).limit(1);
    if (!d) throw new NotFoundException('討論不存在');

    const replies = await this.db.select().from(discussionReplies)
      .where(eq(discussionReplies.discussionId, id))
      .orderBy(discussionReplies.createdAt);

    return {
      discussion: {
        ...d,
        createdAt: d.createdAt.toISOString().split('T')[0],
        replies: replies.map(r => ({ ...r, createdAt: r.createdAt.toISOString().split('T')[0] })),
      },
    };
  }

  async create(data: { board: string; title: string; content: string }, authorId: number) {
    const [d] = await this.db.insert(discussions).values({
      board: data.board,
      title: data.title,
      content: data.content,
      authorId,
      authorName: `User#${authorId}`,
    }).returning();

    return { discussion: { ...d, repliesCount: 0, createdAt: d.createdAt.toISOString().split('T')[0] } };
  }

  async reply(discussionId: number, content: string, authorId: number) {
    const [d] = await this.db.select({ id: discussions.id }).from(discussions)
      .where(eq(discussions.id, discussionId)).limit(1);
    if (!d) throw new NotFoundException('討論不存在');

    const [reply] = await this.db.insert(discussionReplies).values({
      discussionId,
      content,
      authorId,
      authorName: `User#${authorId}`,
    }).returning();

    return { reply: { ...reply, createdAt: reply.createdAt.toISOString().split('T')[0] } };
  }

  async toggleLike(id: number, userId: number) {
    const [d] = await this.db.select().from(discussions).where(eq(discussions.id, id)).limit(1);
    if (!d) throw new NotFoundException('討論不存在');

    // Check if already liked
    const [existing] = await this.db.select().from(discussionLikes)
      .where(and(eq(discussionLikes.discussionId, id), eq(discussionLikes.userId, userId))).limit(1);

    if (existing) {
      await this.db.delete(discussionLikes).where(eq(discussionLikes.id, existing.id));
      await this.db.update(discussions).set({ likes: sql`${discussions.likes} - 1` }).where(eq(discussions.id, id));
      return { liked: false, likes: d.likes - 1 };
    } else {
      await this.db.insert(discussionLikes).values({ discussionId: id, userId });
      await this.db.update(discussions).set({ likes: sql`${discussions.likes} + 1` }).where(eq(discussions.id, id));
      return { liked: true, likes: d.likes + 1 };
    }
  }

  async remove(id: number, userId: number, role: string) {
    const [d] = await this.db.select().from(discussions).where(eq(discussions.id, id)).limit(1);
    if (!d) throw new NotFoundException('討論不存在');
    if (d.authorId !== userId && role !== 'admin') throw new ForbiddenException('無權限');
    await this.db.delete(discussions).where(eq(discussions.id, id));
    return { success: true };
  }
}
