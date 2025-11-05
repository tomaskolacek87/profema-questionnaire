import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { User } from './user.entity';

@Entity('questionnaires')
export class Questionnaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column()
  @Index()
  patient_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  created_by: User;

  @Column()
  created_by_user_id: string;

  // Form Data - JSONB for flexibility
  @Column({ type: 'jsonb' })
  basic_info: any;

  @Column({ type: 'jsonb' })
  pregnancy_info: any;

  @Column({ type: 'jsonb' })
  health_history: any;

  @Column({ type: 'jsonb' })
  previous_pregnancies: any;

  @Column({ type: 'jsonb', nullable: true })
  additional_notes: any;

  // Status
  @Column({ default: 'draft' }) // draft, completed, archived
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // PDF Generation
  @Column({ nullable: true })
  pdf_path: string;

  @Column({ nullable: true })
  google_drive_file_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
