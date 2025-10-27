import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available everywhere
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true, // Handle deprecation warnings
        useUnifiedTopology: true, // Modern topology engine
        retryAttempts: 5, // Auto-retry on failures
        retryDelay: 3000, // Delay between retries
      }),
      inject: [ConfigService],
    }),
    RedisModule, // Add to global access
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
