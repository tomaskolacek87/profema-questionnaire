import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateQuestionnaireDto {
  @IsString()
  patient_id: string;

  @IsObject()
  basic_info: any;

  @IsObject()
  pregnancy_info: any;

  @IsObject()
  health_history: any;

  @IsObject()
  previous_pregnancies: any;

  @IsOptional()
  @IsObject()
  additional_notes?: any;

  @IsOptional()
  @IsString()
  status?: string;
}
