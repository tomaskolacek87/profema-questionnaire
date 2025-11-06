import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { QuestionnaireToken } from '@entities/profema/questionnaire-token.entity';
import { Patient } from '@entities/profema/patient.entity';
import { Questionnaire } from '@entities/profema/questionnaire.entity';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import * as crypto from 'crypto';

@Injectable()
export class MagicLinksService {
  private readonly logger = new Logger(MagicLinksService.name);

  constructor(
    @InjectRepository(QuestionnaireToken, 'profemaConnection')
    private tokenRepo: Repository<QuestionnaireToken>,
    @InjectRepository(Patient, 'profemaConnection')
    private patientRepo: Repository<Patient>,
    @InjectRepository(Questionnaire, 'profemaConnection')
    private questionnaireRepo: Repository<Questionnaire>,
    @InjectDataSource('profemaConnection')
    private dataSource: DataSource,
  ) {}

  /**
   * Generate unique magic link token for patient
   */
  async generateToken(dto: GenerateTokenDto, createdByUserId: string) {
    // Verify patient exists
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patient_id },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check if patient already has an active token
    const existingToken = await this.tokenRepo.findOne({
      where: {
        patient_id: dto.patient_id,
        used_at: null,
      },
    });

    if (existingToken && !existingToken.isExpired()) {
      this.logger.warn(
        `Patient ${dto.patient_id} already has an active token, invalidating old token`,
      );
      // Optionally invalidate the old token or return it
      // For now, we'll create a new one
    }

    // Generate cryptographically secure random token
    const token = crypto.randomBytes(32).toString('hex'); // 64 hex chars

    // Calculate expiration (default 7 days)
    const validDays = dto.valid_days || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validDays);

    // Create token record
    const questionnaireToken = this.tokenRepo.create({
      patient_id: dto.patient_id,
      token,
      expires_at: expiresAt,
      created_by_user_id: createdByUserId,
    });

    await this.tokenRepo.save(questionnaireToken);

    this.logger.log(
      `Generated magic link token for patient ${patient.first_name} ${patient.last_name} (${dto.patient_id})`,
    );

    // TODO: Send email if patient_email provided
    if (dto.patient_email) {
      // await this.sendMagicLinkEmail(patient, token, dto.patient_email);
      this.logger.log(`Email sending not yet implemented`);
    }

    return {
      token_id: questionnaireToken.id,
      token,
      magic_link: `${process.env.FRONTEND_URL}/q/${token}`,
      expires_at: expiresAt,
      patient: {
        id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: dto.patient_email || patient.email,
      },
    };
  }

  /**
   * Validate token and return patient data for prefilling form
   */
  async validateToken(token: string, ipAddress?: string, userAgent?: string) {
    const tokenRecord = await this.tokenRepo.findOne({
      where: { token },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid token');
    }

    if (tokenRecord.isExpired()) {
      throw new UnauthorizedException('Token has expired');
    }

    if (tokenRecord.isUsed()) {
      throw new UnauthorizedException('Token has already been used');
    }

    // Track link click
    if (!tokenRecord.link_clicked_at) {
      await this.tokenRepo.update(tokenRecord.id, {
        link_clicked_at: new Date(),
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    }

    // Load patient separately (to avoid relation issues)
    const patient = await this.patientRepo.findOne({
      where: { id: tokenRecord.patient_id },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    this.logger.log(`Token validated for patient ${patient.id}`);

    return {
      patient: {
        id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
      },
      token_id: tokenRecord.id,
      expires_at: tokenRecord.expires_at,
    };
  }

  /**
   * Submit questionnaire via magic link
   */
  async submitQuestionnaire(
    token: string,
    dto: SubmitQuestionnaireDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tokenRecord = await this.tokenRepo.findOne({
      where: { token },
      relations: ['patient'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid token');
    }

    if (tokenRecord.isExpired()) {
      throw new UnauthorizedException('Token has expired');
    }

    if (tokenRecord.isUsed()) {
      throw new UnauthorizedException('Token has already been used');
    }

    // Create questionnaire
    const questionnaire = this.questionnaireRepo.create({
      patient_id: tokenRecord.patient_id,
      created_by_user_id: tokenRecord.created_by_user_id,
      basic_info: {
        first_name: dto.first_name,
        last_name: dto.last_name,
      },
      pregnancy_info: {
        last_period_date: dto.last_period_date,
        expected_delivery_date: dto.expected_delivery_date,
        pregnancy_number: dto.pregnancy_number,
      },
      health_history: {
        has_chronic_conditions: dto.has_chronic_conditions,
        chronic_conditions: dto.chronic_conditions,
        takes_medications: dto.takes_medications,
        medications: dto.medications,
        has_allergies: dto.has_allergies,
        allergies: dto.allergies,
      },
      previous_pregnancies: {
        pregnancies: dto.previous_pregnancies,
        losses: dto.pregnancy_losses,
      },
      additional_notes: {
        notes: dto.additional_notes,
        gdpr_consent: dto.gdpr_consent,
      },
      status: 'completed',
      completed_at: new Date(),
    });

    const savedQuestionnaire = await this.questionnaireRepo.save(questionnaire);

    // Mark token as used
    await this.tokenRepo.update(tokenRecord.id, {
      used_at: new Date(),
      questionnaire_id: savedQuestionnaire.id,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    this.logger.log(
      `Questionnaire submitted via magic link for patient ${tokenRecord.patient.id}`,
    );

    return {
      questionnaire_id: savedQuestionnaire.id,
      patient_id: tokenRecord.patient_id,
      message: 'Questionnaire successfully submitted',
    };
  }

  /**
   * Get token status (for doctor dashboard)
   */
  async getTokenStatus(patientId: string) {
    const tokens = await this.tokenRepo.find({
      where: { patient_id: patientId },
      order: { created_at: 'DESC' },
      take: 5,
    });

    return tokens.map(token => ({
      id: token.id,
      created_at: token.created_at,
      expires_at: token.expires_at,
      used_at: token.used_at,
      link_clicked_at: token.link_clicked_at,
      questionnaire_id: token.questionnaire_id,
      is_valid: token.isValid(),
      is_expired: token.isExpired(),
      is_used: token.isUsed(),
    }));
  }
}
