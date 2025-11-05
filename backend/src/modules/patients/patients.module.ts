import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from '@entities/profema/patient.entity';
import { AstraiaPatient } from '@entities/astraia/astraia-patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient], 'profemaConnection'),
    TypeOrmModule.forFeature([AstraiaPatient], 'astraiaConnection'),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
