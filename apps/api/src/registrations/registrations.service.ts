import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

export interface Registration { id: number; eventId: number; userId: number; userName: string; status: 'pending' | 'confirmed' | 'cancelled'; note: string; createdAt: string; }

@Injectable()
export class RegistrationsService {
  private registrations: Registration[] = [];
  private nextId = 1;

  async register(eventId: number, userId: number, userName: string, note = '') {
    const existing = this.registrations.find(r => r.eventId === eventId && r.userId === userId && r.status !== 'cancelled');
    if (existing) throw new ConflictException('您已報名此活動');
    const reg: Registration = { id: this.nextId++, eventId, userId, userName, status: 'pending', note, createdAt: new Date().toISOString() };
    this.registrations.push(reg);
    return { registration: reg };
  }

  async cancel(eventId: number, userId: number) {
    const reg = this.registrations.find(r => r.eventId === eventId && r.userId === userId && r.status !== 'cancelled');
    if (!reg) throw new NotFoundException('找不到報名紀錄');
    reg.status = 'cancelled';
    return { success: true };
  }

  async getByEvent(eventId: number) {
    const regs = this.registrations.filter(r => r.eventId === eventId && r.status !== 'cancelled');
    return { registrations: regs, count: regs.length };
  }

  async getByUser(userId: number) {
    return { registrations: this.registrations.filter(r => r.userId === userId && r.status !== 'cancelled') };
  }

  async checkRegistration(eventId: number, userId: number) {
    const reg = this.registrations.find(r => r.eventId === eventId && r.userId === userId && r.status !== 'cancelled');
    return { registered: !!reg, registration: reg || null };
  }

  async confirm(id: number) {
    const reg = this.registrations.find(r => r.id === id);
    if (!reg) throw new NotFoundException();
    reg.status = 'confirmed';
    return { registration: reg };
  }
}
