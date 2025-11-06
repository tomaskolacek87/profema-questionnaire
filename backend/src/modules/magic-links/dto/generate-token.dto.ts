import { IsUUID, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class GenerateTokenDto {
  @IsUUID()
  patient_id: string;

  @IsOptional()
  @IsEmail()
  patient_email?: string; // If we want to send email immediately

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  valid_days?: number; // Default 7 days
}
