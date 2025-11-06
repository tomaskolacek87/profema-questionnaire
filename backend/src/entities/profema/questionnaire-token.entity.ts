import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { User } from './user.entity';
import { Questionnaire } from './questionnaire.entity';

@Entity('questionnaire_tokens')
export class QuestionnaireToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Patient reference
  @Column({ type: 'uuid' })
  patient_id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // Token
  @Column({ length: 64, unique: true })
  @Index()
  token: string;

  // Expiration
  @Column({ type: 'timestamp' })
  @Index()
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  used_at: Date | null;

  // Tracking
  @Column({ type: 'uuid' })
  created_by_user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  created_by: User;

  @CreateDateColumn()
  created_at: Date;

  // Questionnaire link (after submission)
  @Column({ type: 'uuid', nullable: true })
  questionnaire_id: string | null;

  @ManyToOne(() => Questionnaire, { nullable: true })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire | null;

  // Email tracking
  @Column({ type: 'timestamp', nullable: true })
  email_sent_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  email_opened_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  link_clicked_at: Date | null;

  // Security
  @Column({ type: 'inet', nullable: true })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  // Helper methods
  isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  isUsed(): boolean {
    return this.used_at !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }
}
