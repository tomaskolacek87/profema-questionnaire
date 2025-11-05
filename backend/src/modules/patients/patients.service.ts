import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Patient } from '@entities/profema/patient.entity';
import { AstraiaPatient } from '@entities/astraia/astraia-patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectRepository(Patient, 'profemaConnection')
    private profemaPatientRepo: Repository<Patient>,
    @InjectRepository(AstraiaPatient, 'astraiaConnection')
    private astraiaPatientRepo: Repository<AstraiaPatient>,
    private profemaDataSource: DataSource,
  ) {}

  /**
   * DUAL WRITE SERVICE - Transaction-safe write to both databases
   * 1. Writes to Astraia DB first (gets INTEGER id)
   * 2. Then writes to Profema DB with astraia_patient_id foreign key
   * 3. Rollback on any error
   */
  async create(createPatientDto: CreatePatientDto, userId: string): Promise<Patient> {
    const queryRunner = this.profemaDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(
        `Starting DUAL WRITE for patient: ${createPatientDto.first_name} ${createPatientDto.last_name}`,
      );

      // STEP 1: Write to Astraia DB (read-only legacy system)
      const astraiaPatient = this.astraiaPatientRepo.create({
        first_name: createPatientDto.first_name,
        last_name: createPatientDto.last_name,
        birth_date: createPatientDto.birth_date,
        birth_number: createPatientDto.birth_number,
        insurance_number: createPatientDto.insurance_number,
        insurance_company: createPatientDto.insurance_company,
        phone: createPatientDto.phone,
        email: createPatientDto.email,
        address: createPatientDto.address,
        city: createPatientDto.city,
        postal_code: createPatientDto.postal_code,
      });

      const savedAstraiaPatient = await this.astraiaPatientRepo.save(astraiaPatient);
      this.logger.log(`Astraia patient created with ID: ${savedAstraiaPatient.id}`);

      // STEP 2: Write to Profema DB with FK to Astraia
      const profemaPatient = this.profemaPatientRepo.create({
        ...createPatientDto,
        astraia_patient_id: savedAstraiaPatient.id,
        assigned_doctor_id: createPatientDto.assigned_doctor_id || userId,
        gdpr_consent_date: createPatientDto.gdpr_consent ? new Date() : null,
      });

      const savedProfemaPatient = await queryRunner.manager.save(profemaPatient);
      this.logger.log(`Profema patient created with UUID: ${savedProfemaPatient.id}`);

      // COMMIT - Both writes successful
      await queryRunner.commitTransaction();

      this.logger.log(
        `DUAL WRITE SUCCESS - Astraia ID: ${savedAstraiaPatient.id}, Profema UUID: ${savedProfemaPatient.id}`,
      );

      return savedProfemaPatient;
    } catch (error) {
      // ROLLBACK on any error
      await queryRunner.rollbackTransaction();
      this.logger.error(`DUAL WRITE FAILED - Rolling back transaction: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to create patient in both databases',
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Patient[]> {
    return this.profemaPatientRepo.find({
      relations: ['assigned_doctor'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Patient> {
    return this.profemaPatientRepo.findOne({
      where: { id },
      relations: ['assigned_doctor'],
    });
  }

  async update(id: string, updateData: Partial<CreatePatientDto>): Promise<Patient> {
    await this.profemaPatientRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.profemaPatientRepo.delete(id);
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return this.profemaPatientRepo
      .createQueryBuilder('patient')
      .where('patient.first_name ILIKE :query', { query: `%${query}%` })
      .orWhere('patient.last_name ILIKE :query', { query: `%${query}%` })
      .orWhere('patient.birth_number ILIKE :query', { query: `%${query}%` })
      .orderBy('patient.created_at', 'DESC')
      .limit(50)
      .getMany();
  }
}
