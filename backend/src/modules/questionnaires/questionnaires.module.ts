import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { QuestionnairesPublicController } from './questionnaires-public.controller';
import { Questionnaire } from '@entities/profema/questionnaire.entity';
import { Patient } from '@entities/profema/patient.entity';
import { AstraiaPatient } from '@entities/astraia/astraia-patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Questionnaire, Patient], 'profemaConnection'),
    TypeOrmModule.forFeature([AstraiaPatient], 'astraiaConnection'),
  ],
  controllers: [QuestionnairesController, QuestionnairesPublicController],
  providers: [QuestionnairesService],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}
