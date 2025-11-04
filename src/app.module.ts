import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available everywhere
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev', // Switch env auto
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        MONGODB_URI_DEV: Joi.when('NODE_ENV', {
          is: Joi.valid('development', 'test').required,
          then: Joi.string()
            .required()
            .description('Local MongoDB URI for development/test'),
          otherwise: Joi.string().optional(),
        }),
        MONGODB_URI_PROD: Joi.when('NODE_ENV', {
          is: 'production',
          then: Joi.string()
            .required()
            .description('Atlas MongoDB URI for production'),
          otherwise: Joi.string().optional(),
        }),
        PRISMA_URL_DEV: Joi.when('NODE_ENV', {
          is: Joi.valid('development', 'test').required(),
          then: Joi.string()
            .required()
            .description('Local Postgres URI for Prisma in dev/test'),
          otherwise: Joi.string().optional(),
        }),
        PRISMA_URL_PROD: Joi.when('NODE_ENV', {
          is: 'production',
          then: Joi.string()
            .required()
            .description('Cloud/Local Postgres URI for Prisma in prod'),
          otherwise: Joi.string().optional(),
        }),
        REDIS_URL_DEV: Joi.string()
          .optional()
          .description('Local Redis URI for dev/test'),
        REDIS_URL_PROD: Joi.string()
          .optional()
          .description('Cloud Redis URI for prod'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],

      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('MongooseConfig'); // Log module-specific cho debug
        const isProd = configService.get<string>('NODE_ENV') === 'production';

        const waitForMongo = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));
        if (!isProd) {
          await waitForMongo(3000); // Đợi 3s cho MongoDB hoàn toàn sẵn sàng
        }

        const uri = isProd
          ? configService.get<string>('MONGODB_URI_PROD')
          : configService.get<string>('MONGODB_URI_DEV');

        if (!uri) {
          const errorMsg = `${isProd ? 'MONGODB_URI_PROD' : 'MONGODB_URI_DEV'} is undefined - check .env file`;
          logger.error(errorMsg);
          throw new Error(errorMsg);
        }

        // Validate URI format
        try {
          if (
            !uri.startsWith('mongodb://') &&
            !uri.startsWith('mongodb+srv://')
          ) {
            throw new Error('URI must start with mongodb:// or mongodb+srv://');
          }

          new URL(
            uri
              .replace('mongodb://', 'http://')
              .replace('mongodb+srv://', 'https://'),
          );
        } catch (error) {
          logger.error(`Invalid MONGODB_URI format: ${error.message}`);
          throw new Error(
            'Invalid MongDB URI - check .env and format (SRV or port-based)',
          );
        }

        const isSrv = uri?.startsWith('mongodb+srv://');
        logger.log(
          isSrv
            ? 'Using SRV URI for cloud cluster (prod)'
            : 'Using non-SRV URI with explicit port for local (dev)',
        );

        return {
          uri,
          directConnection: true,
          retryAttempts: 3, // Auto-retry on failures
          retryDelay: 3000, // Delay between retries
          // THÊM DEBUG OPTIONS
          ...(isSrv ? { tls: true, ssl: true } : {}), // Auto TLS cho SRV
        };
      },
      inject: [ConfigService],
    }),
    RedisModule, // Add to global access
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
