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

  @Column({ type: 'date' })
  birth_date: Date;

  @Column()
  birth_number: string; // Rodné číslo

  @Column({ nullable: true })
  insurance_number: string;

  @Column({ nullable: true })
  insurance_company: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postal_code: string;

  // Pregnancy Info
  @Column({ type: 'date', nullable: true })
  lmp_date: Date; // Last Menstrual Period

  @Column({ type: 'date', nullable: true })
  edd_date: Date; // Estimated Due Date

  @Column({ type: 'integer', nullable: true })
  gestational_weeks: number;

  @Column({ type: 'integer', nullable: true })
  gestational_days: number;

  @Column({ default: false })
  is_high_risk: boolean;

  // Doctor Assignment
  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_doctor_id' })
  assigned_doctor: User;

  @Column({ nullable: true })
  assigned_doctor_id: string;

  // GDPR
  @Column({ default: false })
  gdpr_consent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  gdpr_consent_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  notes: string;
}
