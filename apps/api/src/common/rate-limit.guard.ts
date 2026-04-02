import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Simple in-memory rate limiting guard.
 * Tracks request counts per IP with a sliding window.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 60_000, maxRequests = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    // Cleanup every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, val] of this.requests.entries()) {
        if (now > val.resetTime) this.requests.delete(key);
      }
    }, 300_000);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record || now > record.resetTime) {
      this.requests.set(ip, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    record.count++;
    if (record.count > this.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      throw new HttpException(
        { statusCode: 429, message: '請求過於頻繁，請稍後再試', retryAfter },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}

/**
 * Stricter rate limit for auth endpoints (login/register).
 * 10 requests per minute per IP.
 */
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs = 60_000;
  private readonly maxRequests = 10;

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, val] of this.requests.entries()) {
        if (now > val.resetTime) this.requests.delete(key);
      }
    }, 300_000);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record || now > record.resetTime) {
      this.requests.set(ip, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    record.count++;
    if (record.count > this.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      throw new HttpException(
        { statusCode: 429, message: '登入/註冊請求過於頻繁，請稍後再試', retryAfter },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
