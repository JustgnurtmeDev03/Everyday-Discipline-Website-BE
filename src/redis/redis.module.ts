import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-labs/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [
    ConfigModule,
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (ConfigService: ConfigService) => ({
        type: 'single',
        url: ConfigService.get<string>('REDIS_URL'),
        options: {
          tls: {}, // Enable TLS for cloud security
          retryStrategy: (times) => Math.min(times * 50, 2000), // Auto-retry
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
