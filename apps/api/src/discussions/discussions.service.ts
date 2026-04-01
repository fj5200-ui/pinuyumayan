import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

export interface Discussion { id: number; board: string; title: string; content: string; authorId: number; authorName: string; likes: number; likedBy: number[]; replies: Reply[]; createdAt: string; }
export interface Reply { id: number; content: string; authorId: number; authorName: string; createdAt: string; }

@Injectable()
export class DiscussionsService {
  // In-memory store (in production, this would be a DB table)
  private discussions: Discussion[] = [
    { id: 1, board: 'general', title: '歡迎來到 Pinuyumayan 社群！', content: '這是一個讓所有關心卑南族文化的朋友交流的空間。', authorId: 1, authorName: 'Admin', likes: 8, likedBy: [], replies: [{ id: 1, content: '感謝建立這個平台！', authorId: 3, authorName: '族人', createdAt: '2026-03-30' }], createdAt: '2026-03-30' },
    { id: 2, board: 'language', title: '族語日常問候用語整理', content: '常用的卑南語問候語：uninan (謝謝)、marekumare (你好)', authorId: 2, authorName: '族語教師', likes: 12, likedBy: [], replies: [], createdAt: '2026-03-29' },
    { id: 3, board: 'culture', title: '2026年大獵祭準備工作開始', content: '今年的大獵祭將在12月舉行，歡迎族人分享準備過程。', authorId: 2, authorName: '部落幹部', likes: 15, likedBy: [], replies: [], createdAt: '2026-03-28' },
    { id: 4, board: 'events', title: '南王部落春季文化體驗營', content: '4月底將舉辦兩天的文化體驗營，內容包含族語教學和傳統工藝。', authorId: 1, authorName: '活動組', likes: 6, likedBy: [], replies: [], createdAt: '2026-03-27' },
  ];
  private nextId = 5;

  async findAll(board?: string, page = 1) {
    const limit = 20;
    const offset = (page - 1) * limit;
    let filtered = this.discussions;
    if (board && board !== 'all') filtered = filtered.filter(d => d.board === board);
    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit).map(d => ({
      ...d, repliesCount: d.replies.length, replies: undefined,
    }));
    return { discussions: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const d = this.discussions.find(d => d.id === id);
    if (!d) throw new NotFoundException('討論不存在');
    return { discussion: d };
  }

  async create(data: { board: string; title: string; content: string }, authorId: number) {
    const d: Discussion = {
      id: this.nextId++,
      board: data.board,
      title: data.title,
      content: data.content,
      authorId,
      authorName: `User#${authorId}`,
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.discussions.unshift(d);
    return { discussion: d };
  }

  async reply(discussionId: number, content: string, authorId: number) {
    const d = this.discussions.find(d => d.id === discussionId);
    if (!d) throw new NotFoundException('討論不存在');
    const reply: Reply = { id: Date.now(), content, authorId, authorName: `User#${authorId}`, createdAt: new Date().toISOString().split('T')[0] };
    d.replies.push(reply);
    return { reply };
  }

  async toggleLike(id: number, userId: number) {
    const d = this.discussions.find(d => d.id === id);
    if (!d) throw new NotFoundException('討論不存在');
    const idx = d.likedBy.indexOf(userId);
    if (idx === -1) { d.likedBy.push(userId); d.likes++; return { liked: true, likes: d.likes }; }
    else { d.likedBy.splice(idx, 1); d.likes--; return { liked: false, likes: d.likes }; }
  }

  async remove(id: number, userId: number, role: string) {
    const idx = this.discussions.findIndex(d => d.id === id);
    if (idx === -1) throw new NotFoundException('討論不存在');
    if (this.discussions[idx].authorId !== userId && role !== 'admin') throw new ForbiddenException('無權限');
    this.discussions.splice(idx, 1);
    return { success: true };
  }
}
