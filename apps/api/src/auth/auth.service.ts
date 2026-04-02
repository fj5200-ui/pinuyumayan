import { Injectable, Inject, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { users } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string, name: string, tribeId?: number) {
    const existing = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new ConflictException('此電子郵件已被使用');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const [user] = await this.db.insert(users).values({
      email, password: hashedPassword, name, tribeId: tribeId || null,
    }).returning();
    const token = this.jwt.sign({ id: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new UnauthorizedException('電子郵件或密碼錯誤');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('電子郵件或密碼錯誤');
    const token = this.jwt.sign({ id: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: number) {
    const [user] = await this.db.select({
      id: users.id, email: users.email, name: users.name, role: users.role,
      tribeId: users.tribeId, avatarUrl: users.avatarUrl, bio: users.bio, createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId)).limit(1);
    return user;
  }

  async updateProfile(userId: number, data: { name?: string; bio?: string; avatarUrl?: string; tribeId?: number }) {
    const updateData: any = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.tribeId !== undefined) updateData.tribeId = data.tribeId;
    await this.db.update(users).set(updateData).where(eq(users.id, userId));
    return this.getProfile(userId);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new UnauthorizedException('用戶不存在');
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new BadRequestException('目前密碼不正確');
    if (newPassword.length < 6) throw new BadRequestException('新密碼至少需要6個字元');
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, userId));
    return { success: true, message: '密碼已更新' };
  }

  async refreshToken(userId: number) {
    const [user] = await this.db.select({
      id: users.id, email: users.email, role: users.role,
    }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new UnauthorizedException('用戶不存在');
    const token = this.jwt.sign({ id: user.id, email: user.email, role: user.role });
    return { token, expiresIn: '7d' };
  }

  async resetPasswordRequest(email: string) {
    const [user] = await this.db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)).limit(1);
    if (!user) return { success: true, message: '如果此信箱已註冊，將收到重設密碼連結' };
    // In production: send email with JWT reset token
    const resetToken = this.jwt.sign({ id: user.id, type: 'reset' }, { expiresIn: '1h' });
    // For now just return the token (in real production, send via email)
    return { success: true, message: '如果此信箱已註冊，將收到重設密碼連結', resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwt.verify(token);
      if (decoded.type !== 'reset') throw new BadRequestException('無效的重設連結');
      if (newPassword.length < 6) throw new BadRequestException('新密碼至少需要6個字元');
      const hashed = await bcrypt.hash(newPassword, 12);
      await this.db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, decoded.id));
      return { success: true, message: '密碼已重設，請重新登入' };
    } catch {
      throw new BadRequestException('重設連結已過期或無效');
    }
  }
}
