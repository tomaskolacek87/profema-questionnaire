import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
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
    @InjectDataSource('profemaConnection')
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

      // STEP 1: Write to Astraia DB using ORIGINAL Astraia column names
      const astraiaPatient = this.astraiaPatientRepo.create({
        name: createPatientDto.last_name,           // Astraia uses 'name' for last name
        other_names: createPatientDto.first_name,   // Astraia uses 'other_names' for first name
        dob: createPatientDto.birth_date,           // Astraia uses 'dob' for birth date
        hospital_number: createPatientDto.birth_number, // Astraia uses 'hospital_number'
        ohip: createPatientDto.insurance_number,    // Astraia uses 'ohip' for insurance
        site: 1,                                    // REQUIRED by Astraia (default site)
      });

      const savedAstraiaPatient = await this.astraiaPatientRepo.save(astraiaPatient);
      this.logger.log(`Astraia patient created with ID: ${savedAstraiaPatient.id}`);

      // STEP 2: Write to Profema DB with FK to Astraia
      const profemaPatientData = {
        ...createPatientDto,
        astraia_patient_id: savedAstraiaPatient.id,
        assigned_doctor_id: createPatientDto.assigned_doctor_id || userId,
        gdpr_consent_date: createPatientDto.gdpr_consent ? new Date() : null,
      };

      const savedProfemaPatient = await queryRunner.manager.save(
        queryRunner.manager.create(Patient, profemaPatientData)
      );
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

  /**
   * Load all patients from Astraia database
   */
  async findAllFromAstraia(): Promise<AstraiaPatient[]> {
    this.logger.log('Loading patients from Astraia database...');
    const patients = await this.astraiaPatientRepo.find({
      order: { last_visit: 'DESC' }, // Astraia uses 'last_visit' not 'created_at'
    });
    this.logger.log(`Loaded ${patients.length} patients from Astraia`);
    return patients;
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

  /**
   * Advanced filtering with pagination
   */
  async findWithFilters(filters: {
    status?: string;
    assignedDoctorId?: string;
    sort?: string;
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }): Promise<{ data: Patient[]; total: number; page: number; totalPages: number }> {
    const { status, assignedDoctorId, sort = 'created_at', order = 'DESC', page = 1, limit = 20 } = filters;

    const queryBuilder = this.profemaPatientRepo
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.assigned_doctor', 'doctor');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('patient.status = :status', { status });
    }

    if (assignedDoctorId) {
      queryBuilder.andWhere('patient.assigned_doctor_id = :assignedDoctorId', { assignedDoctorId });
    }

    // Apply sorting
    const validSortFields = ['created_at', 'first_name', 'last_name', 'date_of_birth'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    queryBuilder.orderBy(`patient.${sortField}`, order);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
