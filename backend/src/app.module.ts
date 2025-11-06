import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getProfemaDbConfig } from '@config/profema.database.config';
import { getAstraiaDbConfig } from '@config/astraia.database.config';
import { AuthModule } from '@modules/auth/auth.module';
import { PatientsModule } from '@modules/patients/patients.module';
import { QuestionnairesModule } from '@modules/questionnaires/questionnaires.module';
import { GoogleModule } from '@modules/google/google.module';
import { StatisticsModule } from '@modules/statistics/statistics.module';
import { MagicLinksModule } from '@modules/magic-links/magic-links.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Profema Database Connection (PORT 5433!)
    TypeOrmModule.forRootAsync({
      name: 'profemaConnection',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...getProfemaDbConfig(configService),
        name: 'profemaConnection',
      }),
    }),

    // Astraia Database Connection (PORT 5433!)
    TypeOrmModule.forRootAsync({
      name: 'astraiaConnection',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...getAstraiaDbConfig(configService),
        name: 'astraiaConnection',
      }),
    }),

    // Feature Modules
    AuthModule,
    PatientsModule,
    QuestionnairesModule,
    GoogleModule,
    StatisticsModule,
    MagicLinksModule,
  ],
})
export class AppModule {}
