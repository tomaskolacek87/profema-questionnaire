import { IsString, IsOptional, IsDateString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PreviousPregnancyDto {
  @IsOptional()
  @IsString()
  pregnancy_number?: string;

  @IsOptional()
  @IsDateString()
  delivery_date?: string;

  @IsOptional()
  @IsString()
  delivery_type?: string;

  @IsOptional()
  @IsString()
  complications?: string;

  @IsOptional()
  @IsString()
  baby_weight?: string;
}

export class PregnancyLossDto {
  @IsOptional()
  @IsString()
  loss_type?: string;

  @IsOptional()
  @IsDateString()
  loss_date?: string;

  @IsOptional()
  @IsString()
  complications?: string;
}

export class SubmitQuestionnaireDto {
  // Personal Info (prefilled by token)
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  // Pregnancy Details
  @IsOptional()
  @IsDateString()
  last_period_date?: string;

  @IsOptional()
  @IsDateString()
  expected_delivery_date?: string;

  @IsOptional()
  @IsString()
  pregnancy_number?: string; // First, second, etc.

  // Medical History
  @IsOptional()
  @IsBoolean()
  has_chronic_conditions?: boolean;

  @IsOptional()
  @IsString()
  chronic_conditions?: string;

  @IsOptional()
  @IsBoolean()
  takes_medications?: boolean;

  @IsOptional()
  @IsString()
  medications?: string;

  @IsOptional()
  @IsBoolean()
  has_allergies?: boolean;

  @IsOptional()
  @IsString()
  allergies?: string;

  // Previous Pregnancies
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviousPregnancyDto)
  previous_pregnancies?: PreviousPregnancyDto[];

  // Pregnancy Losses
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PregnancyLossDto)
  pregnancy_losses?: PregnancyLossDto[];

  // Additional Notes
  @IsOptional()
  @IsString()
  additional_notes?: string;

  // GDPR
  @IsBoolean()
  gdpr_consent: boolean;
}
