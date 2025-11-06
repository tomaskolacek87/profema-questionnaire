import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Link to Astraia DB patient (INTEGER id!)
  @Column({ type: 'integer', nullable: true })
  @Index()
  astraia_patient_id: number;

  // Basic Info
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @Column({ nullable: true })
  birth_number: string; // Rodné číslo

  @Column({ nullable: true })
  insurance_number: string;

  @Column({ nullable: true })
  insurance_company: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'address_street', nullable: true })
  address: string;

  @Column({ name: 'address_city', nullable: true })
  city: string;

  @Column({ name: 'address_zip', nullable: true })
  postal_code: string;

  @Column({ nullable: true })
  attending_gynecologist: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_before_pregnancy_kg: number;

  @Column({ nullable: true })
  google_drive_folder_id: string;

  @Column({ default: false })
  gdpr_consent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  gdpr_consent_date: Date;

  @Column({ default: false })
  data_processing_consent: boolean;

  @Column({ default: false })
  scientific_use_consent: boolean;

  @Column({ nullable: true })
  created_by: string;

  // Assigned doctor (relation to User)
  @Column({ type: 'uuid', nullable: true })
  assigned_doctor_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_doctor_id' })
  assigned_doctor: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: true })
  is_active: boolean;
}
