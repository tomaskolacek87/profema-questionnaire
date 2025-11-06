import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Astraia Patient Entity - READ-ONLY mapping to ORIGINAL Astraia DB
 * CRITICAL: Maps to real 'patient' table in Astraia (NOT 'patients')
 * CRITICAL: Uses REAL Astraia column names (name, dob, hospital_number, other_names)
 * CRITICAL: This DB is replicated to another server - MUST stay compatible!
 *
 * Source: /database/astraia_pg1_2025-11-05_050512.backup
 */
@Entity('patient', { schema: 'public' })
export class AstraiaPatient {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string; // Last name in Astraia

  @Column({ type: 'varchar', length: 100, nullable: true })
  other_names: string; // First name in Astraia

  @Column({ type: 'date', nullable: true })
  dob: Date; // Date of birth

  @Column({ type: 'varchar', length: 24, nullable: true })
  hospital_number: string; // Patient ID

  @Column({ type: 'varchar', length: 1000, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  name_maiden: string;

  @Column({ type: 'integer', nullable: true })
  insurance_company: number;

  @Column({ type: 'varchar', length: 15, nullable: true })
  ohip: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  nhs_number: string;

  @Column({ type: 'date', nullable: true })
  last_visit: Date;

  @Column({ type: 'date', nullable: true })
  first_contact: Date;

  @Column({ type: 'integer', nullable: false, default: 1 })
  site: number; // REQUIRED by Astraia

  @Column({ type: 'boolean', nullable: true })
  vipstatus: boolean;

  @Column({ type: 'smallint', nullable: true })
  gender: number;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  messages: string;

  // Compatibility getters for frontend/backend
  get first_name(): string {
    return this.other_names || '';
  }

  get last_name(): string {
    return this.name || '';
  }

  get birth_date(): Date {
    return this.dob;
  }

  get birth_number(): string {
    return this.hospital_number || '';
  }
}
