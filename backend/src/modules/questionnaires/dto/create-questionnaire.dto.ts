import { IsString, IsObject, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionnaireDto {
  @IsOptional()
  @IsString()
  patient_id?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsObject()
  basic_info: any;

  @IsObject()
  pregnancy_info: any;

  @IsOptional()
  @IsObject()
  lifestyle?: any;

  @IsObject()
  health_history: any;

  @IsObject()
  previous_pregnancies: any;

  @IsOptional()
  @IsObject()
  blood_pressure?: any;

  @IsOptional()
  @IsObject()
  additional_notes?: any;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completed_at?: Date;
}
