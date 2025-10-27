import { InjectRedis } from '@nestjs-labs/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setCache(
    key: string,
    value: string,
    ttl: number = 3600,
  ): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl); // Expire sau 1 giờ
  }

  async getCache(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
}
