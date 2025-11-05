import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getAstraiaDbConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('ASTRAIA_DB_HOST'),
  port: parseInt(configService.get('ASTRAIA_DB_PORT', '5433')),
  username: configService.get('ASTRAIA_DB_USERNAME'),
  password: configService.get('ASTRAIA_DB_PASSWORD'),
  database: configService.get('ASTRAIA_DB_NAME'),
  entities: [__dirname + '/../entities/astraia/*.entity{.ts,.js}'],
  synchronize: false, // Never auto-sync Astraia DB!
  logging: configService.get('NODE_ENV') === 'development',
  ssl: false,
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
});
