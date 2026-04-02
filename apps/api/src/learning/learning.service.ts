import { Injectable } from '@nestjs/common';

export interface LearningRecord { userId: number; wordId: number; correct: boolean; ts: string; }
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
  private records: Map<number, LearningRecord[]> = new Map();
  private userBadges: Map<number, Set<string>> = new Map();
  private learnedWords: Map<number, Set<number>> = new Map();

  async getProgress(userId: number) {
    const records = this.records.get(userId) || [];
    const learned = this.learnedWords.get(userId) || new Set();
    const badges = this.userBadges.get(userId) || new Set();
    const total = records.length;
    const correct = records.filter(r => r.correct).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Calculate streaks and daily stats
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.ts.startsWith(today));
    const streak = this.calcStreak(records);
    const weeklyData = this.calcWeekly(records);

    return {
      totalQuizzes: total, correctAnswers: correct, accuracy,
      learnedWords: learned.size, streak, todayQuizzes: todayRecords.length,
      todayCorrect: todayRecords.filter(r => r.correct).length,
      badges: BADGES.filter(b => badges.has(b.id)),
      allBadges: BADGES.map(b => ({ ...b, earned: badges.has(b.id) })),
      weeklyData,
    };
  }

  async recordQuiz(userId: number, wordId: number, correct: boolean) {
    if (!this.records.has(userId)) this.records.set(userId, []);
    this.records.get(userId)!.push({ userId, wordId, correct, ts: new Date().toISOString() });
    if (correct) {
      if (!this.learnedWords.has(userId)) this.learnedWords.set(userId, new Set());
      this.learnedWords.get(userId)!.add(wordId);
    }
    this.checkBadges(userId);
    return { success: true, learned: this.learnedWords.get(userId)?.size || 0 };
  }

  async markLearned(userId: number, wordIds: number[]) {
    if (!this.learnedWords.has(userId)) this.learnedWords.set(userId, new Set());
    wordIds.forEach(id => this.learnedWords.get(userId)!.add(id));
    this.checkBadges(userId);
    return { success: true, learned: this.learnedWords.get(userId)!.size };
  }

  async getLeaderboard() {
    const entries: { userId: number; learned: number; quizzes: number; accuracy: number }[] = [];
    this.learnedWords.forEach((words, userId) => {
      const records = this.records.get(userId) || [];
      const correct = records.filter(r => r.correct).length;
      entries.push({ userId, learned: words.size, quizzes: records.length, accuracy: records.length > 0 ? Math.round((correct / records.length) * 100) : 0 });
    });
    return { leaderboard: entries.sort((a, b) => b.learned - a.learned).slice(0, 20) };
  }

  private checkBadges(userId: number) {
    if (!this.userBadges.has(userId)) this.userBadges.set(userId, new Set());
    const badges = this.userBadges.get(userId)!;
    const learned = this.learnedWords.get(userId)?.size || 0;
    const records = this.records.get(userId) || [];
    if (learned >= 1) badges.add('first_word');
    if (learned >= 10) badges.add('ten_words');
    if (learned >= 50) badges.add('collector');
    // Streak check
    let streak = 0;
    for (let i = records.length - 1; i >= 0; i--) {
      if (records[i].correct) streak++; else break;
    }
    if (streak >= 10) badges.add('quiz_master');
  }

  private calcStreak(records: LearningRecord[]): number {
    if (records.length === 0) return 0;
    const days = new Set(records.map(r => r.ts.split('T')[0]));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (days.has(d.toISOString().split('T')[0])) streak++; else break;
    }
    return streak;
  }

  private calcWeekly(records: LearningRecord[]) {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const data = days.map((d, i) => {
      const date = new Date(); date.setDate(date.getDate() - (6 - i));
      const key = date.toISOString().split('T')[0];
      const dayRecords = records.filter(r => r.ts.startsWith(key));
      return { day: d, date: key, total: dayRecords.length, correct: dayRecords.filter(r => r.correct).length };
    });
    return data;
  }
}
