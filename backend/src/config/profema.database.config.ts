import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getProfemaDbConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('PROFEMA_DB_HOST'),
  port: parseInt(configService.get('PROFEMA_DB_PORT', '5433')),
  username: configService.get('PROFEMA_DB_USERNAME'),
  password: configService.get('PROFEMA_DB_PASSWORD'),
  database: configService.get('PROFEMA_DB_NAME'),
  entities: [__dirname + '/../entities/profema/*.entity{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: false,
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
});
