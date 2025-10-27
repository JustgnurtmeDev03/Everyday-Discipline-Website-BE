import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  async onModuleInit() {
    try {
      await this.$connect(); // Kết nối tự động khi module init
      this.logger.log('Prisma connected to PostgreSQL successfully');
    } catch (error) {
      this.logger.error('Prisma connection failed:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
