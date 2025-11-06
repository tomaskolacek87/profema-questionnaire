import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MagicLinksService } from './magic-links.service';
import { MagicLinksController } from './magic-links.controller';
import { QuestionnaireToken } from '@entities/profema/questionnaire-token.entity';
import { Patient } from '@entities/profema/patient.entity';
import { Questionnaire } from '@entities/profema/questionnaire.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [QuestionnaireToken, Patient, Questionnaire],
      'profemaConnection',
    ),
  ],
  controllers: [MagicLinksController],
  providers: [MagicLinksService],
  exports: [MagicLinksService],
})
export class MagicLinksModule {}
