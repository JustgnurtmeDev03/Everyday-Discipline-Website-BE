import { InjectRedis } from '@nestjs-labs/nestjs-redis';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
import { Connection } from 'mongoose';
import { HealthStatus } from 'src/common/enums/health-status.enum';
import { PrismaService } from 'src/prisma/prisma.service';

export interface HealthDetails {
  postgresql: HealthStatus;
  mongodb: HealthStatus;
  redis: HealthStatus;
}

@Injectable()
export class HealthService implements OnModuleInit {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private prisma: PrismaService,
    @InjectRedis() private redisClient: Redis,
    @InjectConnection() private mongoConnection?: Connection,
  ) {
    if (!this.mongoConnection) {
      this.logger.warn(
        'MongoDB connection might be undefined - verify MongooseModule config',
      );
    }
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing health checks...');
    const status = await this.getHealthStatus();
    Object.entries(status).forEach(([db, st]) => {
      if (st === HealthStatus.UP) {
        this.logger.log(`${db.toUpperCase()} connected successfully`);
      } else {
        this.logger.error(
          `${db.toUpperCase()} connection failed - check config/env vars`,
        );
      }
    });
  }

  async getHealthStatus(): Promise<HealthDetails> {
    const checks = await Promise.allSettled([
      this.checkPostgreSQL(),
      this.checkMongoDB(),
      this.checkRedis(),
    ]);
    return {
      postgresql: this.getStatus(checks[0]),
      mongodb: this.getStatus(checks[1]),
      redis: this.getStatus(checks[2]),
    };
  }

  private async checkPostgreSQL(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkMongoDB(): Promise<void> {
    await this.mongoConnection?.db?.admin()?.ping();
  }

  private async checkRedis(): Promise<void> {
    await this.redisClient.ping();
  }

  private getStatus(result: PromiseSettledResult<void>): HealthStatus {
    if (result.status === 'rejected') {
      this.logger.error(
        `Heath check failed for a DB ${result.reason?.message || 'Unknown error'}`,
      );
    }
    return result.status === 'fulfilled' ? HealthStatus.UP : HealthStatus.DOWN;
  }
}
