import { IsString, IsUUID, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  appointmentType?: string; // 'consultation', 'checkup', 'ultrasound', 'surgery', 'other'

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsOptional()
  status?: string; // 'scheduled', 'confirmed', 'cancelled', 'completed', 'no_show'

  @IsString()
  @IsOptional()
  internalNotes?: string;

  @IsString()
  @IsOptional()
  patientNotes?: string;

  @IsBoolean()
  @IsOptional()
  confirmationRequired?: boolean;
}
