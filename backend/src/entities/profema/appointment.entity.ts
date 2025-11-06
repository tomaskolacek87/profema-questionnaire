import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Doctor & Patient
  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { eager: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Patient, { nullable: true, eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // Appointment Details
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'appointment_type', length: 50, nullable: true })
  appointmentType: string; // 'consultation', 'checkup', 'ultrasound', 'surgery', 'other'

  // Timing
  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  // Location
  @Column({ length: 255, default: 'Ordinace Profema' })
  location: string;

  @Column({ length: 50, nullable: true })
  room: string;

  // Status
  @Column({ length: 50, default: 'scheduled' })
  status: string; // 'scheduled', 'confirmed', 'cancelled', 'completed', 'no_show'

  // Google Calendar Integration
  @Column({ name: 'google_event_id', length: 255, nullable: true })
  googleEventId: string;

  @Column({ name: 'google_synced_at', type: 'timestamp', nullable: true })
  googleSyncedAt: Date;

  // Patient Communication
  @Column({ name: 'reminder_sent', default: false })
  reminderSent: boolean;

  @Column({ name: 'reminder_sent_at', type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  @Column({ name: 'confirmation_required', default: false })
  confirmationRequired: boolean;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'confirmed_by', length: 100, nullable: true })
  confirmedBy: string; // 'patient', 'doctor', 'system'

  // Notes
  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string; // Private notes for doctor

  @Column({ name: 'patient_notes', type: 'text', nullable: true })
  patientNotes: string; // Notes visible to patient

  // Recurrence
  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_rule', type: 'text', nullable: true })
  recurrenceRule: string; // RRULE format

  @Column({ name: 'parent_appointment_id', type: 'uuid', nullable: true })
  parentAppointmentId: string;

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelled_by' })
  cancelledBy: User;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  // Virtual fields
  get durationMinutes(): number {
    if (!this.startTime || !this.endTime) return 0;
    return Math.floor(
      (new Date(this.endTime).getTime() - new Date(this.startTime).getTime()) /
        (1000 * 60),
    );
  }

  get isUpcoming(): boolean {
    return new Date(this.startTime) > new Date();
  }

  get isPast(): boolean {
    return new Date(this.endTime) < new Date();
  }

  get isToday(): boolean {
    const today = new Date();
    const start = new Date(this.startTime);
    return (
      start.getDate() === today.getDate() &&
      start.getMonth() === today.getMonth() &&
      start.getFullYear() === today.getFullYear()
    );
  }
}
