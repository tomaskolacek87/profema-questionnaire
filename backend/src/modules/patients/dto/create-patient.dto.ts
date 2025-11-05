import {
  IsString,
  IsDate,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientDto {
  // Basic Info
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsDate()
  @Type(() => Date)
  birth_date: Date;

  @IsString()
  birth_number: string;

  @IsOptional()
  @IsString()
  insurance_number?: string;

  @IsOptional()
  @IsString()
  insurance_company?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  // Pregnancy Info
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lmp_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  edd_date?: Date;

  @IsOptional()
  @IsNumber()
  gestational_weeks?: number;

  @IsOptional()
  @IsNumber()
  gestational_days?: number;

  @IsOptional()
  @IsBoolean()
  is_high_risk?: boolean;

  @IsOptional()
  @IsString()
  assigned_doctor_id?: string;

  // GDPR
  @IsBoolean()
  gdpr_consent: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
