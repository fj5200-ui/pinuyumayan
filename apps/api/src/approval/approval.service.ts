import { Injectable, NotFoundException } from '@nestjs/common';

export interface ApprovalItem { id: number; type: 'article' | 'comment' | 'media' | 'event'; title: string; content: string; submittedBy: string; submittedById: number; status: 'pending' | 'approved' | 'rejected'; reviewedBy?: string; reviewNote?: string; createdAt: string; reviewedAt?: string; }

@Injectable()
export class ApprovalService {
  private items: ApprovalItem[] = [
    { id: 1, type: 'article', title: '卑南族年祭的意義', content: '年祭是卑南族最重要的傳統祭典...', submittedBy: '族語教師', submittedById: 2, status: 'pending', createdAt: '2026-03-30T10:00:00Z' },
    { id: 2, type: 'comment', title: '文章留言審核', content: '這篇文章寫得很好！', submittedBy: '一般用戶', submittedById: 3, status: 'pending', createdAt: '2026-03-29T15:30:00Z' },
    { id: 3, type: 'media', title: '大獵祭影片', content: '上傳大獵祭紀錄影片', submittedBy: '部落幹部', submittedById: 2, status: 'pending', createdAt: '2026-03-28T09:00:00Z' },
    { id: 4, type: 'article', title: '傳統編織工藝', content: '卑南族的傳統編織工藝...', submittedBy: '族語教師', submittedById: 2, status: 'approved', reviewedBy: 'Admin', reviewNote: '內容詳實', createdAt: '2026-03-25T08:00:00Z', reviewedAt: '2026-03-26T10:00:00Z' },
  ];
  private nextId = 5;

  async getQueue(status?: string, type?: string, page = 1) {
    let filtered = this.items;
    if (status) filtered = filtered.filter(i => i.status === status);
    if (type) filtered = filtered.filter(i => i.type === type);
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const limit = 20; const offset = (page - 1) * limit;
    return { items: filtered.slice(offset, offset + limit), pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) }, stats: { pending: this.items.filter(i => i.status === 'pending').length, approved: this.items.filter(i => i.status === 'approved').length, rejected: this.items.filter(i => i.status === 'rejected').length } };
  }

  async approve(id: number, reviewedBy: string, note?: string) {
    const item = this.items.find(i => i.id === id);
    if (!item) throw new NotFoundException();
    item.status = 'approved'; item.reviewedBy = reviewedBy; item.reviewNote = note; item.reviewedAt = new Date().toISOString();
    return { item };
  }

  async reject(id: number, reviewedBy: string, note?: string) {
    const item = this.items.find(i => i.id === id);
    if (!item) throw new NotFoundException();
    item.status = 'rejected'; item.reviewedBy = reviewedBy; item.reviewNote = note; item.reviewedAt = new Date().toISOString();
    return { item };
  }

  async submit(type: string, title: string, content: string, userId: number, userName: string) {
    const item: ApprovalItem = { id: this.nextId++, type: type as any, title, content, submittedBy: userName, submittedById: userId, status: 'pending', createdAt: new Date().toISOString() };
    this.items.push(item);
    return { item };
  }
}
