import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, sql, and, count } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { learningRecords, learnedWords, userBadges, vocabulary } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

export interface Badge { id: string; name: string; icon: string; description: string; condition: string; }

const BADGES: Badge[] = [
  { id: 'first_word', name: '初學者', icon: '🌱', description: '學會第一個詞彙', condition: 'learned >= 1' },
  { id: 'ten_words', name: '勤學者', icon: '📚', description: '學會 10 個詞彙', condition: 'learned >= 10' },
  { id: 'quiz_master', name: '測驗達人', icon: '🎯', description: '連續答對 10 題', condition: 'streak >= 10' },
  { id: 'all_greetings', name: '問候達人', icon: '👋', description: '學會所有問候詞', condition: 'category_complete:問候' },
  { id: 'daily_learner', name: '每日學習', icon: '🔥', description: '連續 7 天學習', condition: 'daily_streak >= 7' },
  { id: 'collector', name: '收藏家', icon: '💎', description: '學會 50 個詞彙', condition: 'learned >= 50' },
  { id: 'perfect_quiz', name: '滿分達人', icon: '🏆', description: '測驗全部答對', condition: 'perfect_quiz' },
  { id: 'culture_lover', name: '文化愛好者', icon: '🎭', description: '閱讀 10 篇文化文章', condition: 'articles_read >= 10' },
];

@Injectable()
export class LearningService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async getProgress(userId: number) {
    // Count records
    const [{ total }] = await this.db.select({ total: count() }).from(learningRecords).where(eq(learningRecords.userId, userId));
    const [{ correct }] = await this.db.select({ correct: count() }).from(learningRecords).where(and(eq(learningRecords.userId, userId), eq(learningRecords.correct, true)));
    const accuracy = Number(total) > 0 ? Math.round((Number(correct) / Number(total)) * 100) : 0;

    // Learned words count
    const [{ learnedCount }] = await this.db.select({ learnedCount: count() }).from(learnedWords).where(eq(learnedWords.userId, userId));

    // Today's records
    const todayStr = new Date().toISOString().split('T')[0];
    const [{ todayTotal }] = await this.db.select({ todayTotal: count() }).from(learningRecords).where(and(eq(learningRecords.userId, userId), sql`${learningRecords.createdAt} >= ${todayStr}::timestamp`));
    const [{ todayCorrect }] = await this.db.select({ todayCorrect: count() }).from(learningRecords).where(and(eq(learningRecords.userId, userId), eq(learningRecords.correct, true), sql`${learningRecords.createdAt} >= ${todayStr}::timestamp`));

    // Streak (consecutive days)
    const streak = await this.calcStreak(userId);

    // Badges
    const earnedBadges = await this.db.select({ badgeId: userBadges.badgeId }).from(userBadges).where(eq(userBadges.userId, userId));
    const earnedSet = new Set(earnedBadges.map(b => b.badgeId));

    // Weekly data
    const weeklyData = await this.calcWeekly(userId);

    return {
      totalQuizzes: Number(total), correctAnswers: Number(correct), accuracy,
      learnedWords: Number(learnedCount), streak, todayQuizzes: Number(todayTotal),
      todayCorrect: Number(todayCorrect),
      badges: BADGES.filter(b => earnedSet.has(b.id)),
      allBadges: BADGES.map(b => ({ ...b, earned: earnedSet.has(b.id) })),
      weeklyData,
    };
  }

  async recordQuiz(userId: number, wordId: number, correct: boolean) {
    await this.db.insert(learningRecords).values({ userId, wordId, correct });
    if (correct) {
      await this.db.insert(learnedWords).values({ userId, wordId }).onConflictDoNothing();
    }
    await this.checkBadges(userId);
    const [{ learnedCount }] = await this.db.select({ learnedCount: count() }).from(learnedWords).where(eq(learnedWords.userId, userId));
    return { success: true, learned: Number(learnedCount) };
  }

  async markLearned(userId: number, wordIds: number[]) {
    for (const wordId of wordIds) {
      await this.db.insert(learnedWords).values({ userId, wordId }).onConflictDoNothing();
    }
    await this.checkBadges(userId);
    const [{ learnedCount }] = await this.db.select({ learnedCount: count() }).from(learnedWords).where(eq(learnedWords.userId, userId));
    return { success: true, learned: Number(learnedCount) };
  }

  async getLeaderboard() {
    // Get top learners by learned words count
    const rows = await this.db
      .select({
        userId: learnedWords.userId,
        learned: count(),
      })
      .from(learnedWords)
      .groupBy(learnedWords.userId)
      .orderBy(desc(count()))
      .limit(20);

    const entries: { userId: number; learned: number; quizzes: number; accuracy: number }[] = [];
    for (const row of rows) {
      const [{ total }] = await this.db.select({ total: count() }).from(learningRecords).where(eq(learningRecords.userId, row.userId));
      const [{ correct }] = await this.db.select({ correct: count() }).from(learningRecords).where(and(eq(learningRecords.userId, row.userId), eq(learningRecords.correct, true)));
      entries.push({
        userId: row.userId,
        learned: Number(row.learned),
        quizzes: Number(total),
        accuracy: Number(total) > 0 ? Math.round((Number(correct) / Number(total)) * 100) : 0,
      });
    }
    return { leaderboard: entries };
  }

  private async checkBadges(userId: number) {
    const [{ learnedCount }] = await this.db.select({ learnedCount: count() }).from(learnedWords).where(eq(learnedWords.userId, userId));
    const learned = Number(learnedCount);

    const toAdd: string[] = [];
    if (learned >= 1) toAdd.push('first_word');
    if (learned >= 10) toAdd.push('ten_words');
    if (learned >= 50) toAdd.push('collector');

    // Check quiz streak
    const recent = await this.db.select({ correct: learningRecords.correct }).from(learningRecords)
      .where(eq(learningRecords.userId, userId)).orderBy(desc(learningRecords.createdAt)).limit(20);
    let streak = 0;
    for (const r of recent) { if (r.correct) streak++; else break; }
    if (streak >= 10) toAdd.push('quiz_master');

    for (const badgeId of toAdd) {
      await this.db.insert(userBadges).values({ userId, badgeId }).onConflictDoNothing();
    }
  }

  private async calcStreak(userId: number): Promise<number> {
    const records = await this.db
      .select({ day: sql<string>`DATE(${learningRecords.createdAt})` })
      .from(learningRecords)
      .where(eq(learningRecords.userId, userId))
      .groupBy(sql`DATE(${learningRecords.createdAt})`)
      .orderBy(desc(sql`DATE(${learningRecords.createdAt})`));

    if (records.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (records.some(r => r.day === key)) streak++;
      else break;
    }
    return streak;
  }

  private async calcWeekly(userId: number) {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const data: { day: string; date: string; total: number; correct: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(); date.setDate(date.getDate() - (6 - i));
      const key = date.toISOString().split('T')[0];
      const dayEndDate = new Date(key); dayEndDate.setDate(dayEndDate.getDate() + 1);
      const dayEndStr = dayEndDate.toISOString().split('T')[0];
      const [{ total }] = await this.db.select({ total: count() }).from(learningRecords).where(and(eq(learningRecords.userId, userId), sql`${learningRecords.createdAt} >= ${key}::timestamp`, sql`${learningRecords.createdAt} < ${dayEndStr}::timestamp`));
      const [{ correct }] = await this.db.select({ correct: count() }).from(learningRecords).where(and(eq(learningRecords.userId, userId), eq(learningRecords.correct, true), sql`${learningRecords.createdAt} >= ${key}::timestamp`, sql`${learningRecords.createdAt} < ${dayEndStr}::timestamp`));
      data.push({ day: days[date.getDay()], date: key, total: Number(total), correct: Number(correct) });
    }
    return data;
  }
}
