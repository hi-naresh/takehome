import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly requests = new Map<
    string,
    { count: number; resetTime: number }
  >();

  constructor(private configService: ConfigService) {}

  private getConfig(): RateLimitConfig {
    return {
      windowMs: this.configService.get<number>(
        'RATE_LIMIT_WINDOW_MS',
        15 * 60 * 1000,
      ), // 15 minutes
      maxRequests: this.configService.get<number>(
        'RATE_LIMIT_MAX_REQUESTS',
        100,
      ),
    };
  }

  checkRateLimit(identifier: string): boolean {
    const config = this.getConfig();
    const now = Date.now();
    const key = identifier;

    const current = this.requests.get(key);

    if (!current || now > current.resetTime) {
      // Reset or initialize
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (current.count >= config.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${identifier}`);
      return false;
    }

    current.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const config = this.getConfig();
    const current = this.requests.get(identifier);

    if (!current) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - current.count);
  }

  getResetTime(identifier: string): number {
    const current = this.requests.get(identifier);
    return current?.resetTime || 0;
  }
}
