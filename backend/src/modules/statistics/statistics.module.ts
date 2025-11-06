import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Patient } from '@entities/profema/patient.entity';
import { Questionnaire } from '@entities/profema/questionnaire.entity';
import { User } from '@entities/profema/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Questionnaire, User], 'profemaConnection'),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
