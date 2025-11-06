import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Info
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 50, nullable: true })
  title: string; // MUDr., Prof., etc.

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  // Professional Info
  @Column({ length: 100, nullable: true })
  specialty: string; // Gynekologie, Porodnictví

  @Column({ name: 'license_number', length: 100, nullable: true })
  licenseNumber: string;

  // Calendar Settings
  @Column({ name: 'calendar_color', length: 7, default: '#a855f7' })
  calendarColor: string;

  @Column({ name: 'working_hours', type: 'jsonb', nullable: true })
  workingHours: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };

  // Google Calendar Integration
  @Column({ name: 'google_calendar_id', length: 255, nullable: true })
  googleCalendarId: string;

  @Column({ name: 'google_access_token', type: 'text', nullable: true })
  googleAccessToken: string;

  @Column({ name: 'google_refresh_token', type: 'text', nullable: true })
  googleRefreshToken: string;

  @Column({ name: 'google_token_expiry', type: 'timestamp', nullable: true })
  googleTokenExpiry: Date;

  @Column({ name: 'google_sync_enabled', default: false })
  googleSyncEnabled: boolean;

  // Status
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  get fullName(): string {
    return `${this.title ? this.title + ' ' : ''}${this.firstName} ${this.lastName}`.trim();
  }
}
