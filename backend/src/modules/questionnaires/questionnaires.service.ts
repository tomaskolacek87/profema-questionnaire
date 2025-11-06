import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '@entities/profema/questionnaire.entity';
import { Patient } from '@entities/profema/patient.entity';
import { AstraiaPatient } from '@entities/astraia/astraia-patient.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { randomBytes } from 'crypto';

@Injectable()
export class QuestionnairesService {
  private readonly logger = new Logger(QuestionnairesService.name);

  constructor(
    @InjectRepository(Questionnaire, 'profemaConnection')
    private questionnaireRepo: Repository<Questionnaire>,
    @InjectRepository(Patient, 'profemaConnection')
    private patientRepo: Repository<Patient>,
    @InjectRepository(AstraiaPatient, 'astraiaConnection')
    private astraiaPatientRepo: Repository<AstraiaPatient>,
  ) {}

  async create(
    createQuestionnaireDto: CreateQuestionnaireDto,
    userId: string,
  ): Promise<Questionnaire> {
    const questionnaire = this.questionnaireRepo.create({
      ...createQuestionnaireDto,
      created_by_user_id: userId,
      status: createQuestionnaireDto.status || 'draft',
    });

    return this.questionnaireRepo.save(questionnaire);
  }

  async findAll(): Promise<Questionnaire[]> {
    return this.questionnaireRepo.find({
      relations: ['patient', 'created_by'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Questionnaire> {
    return this.questionnaireRepo.findOne({
      where: { id },
      relations: ['patient', 'created_by'],
    });
  }

  async findByPatient(patientId: string): Promise<Questionnaire[]> {
    return this.questionnaireRepo.find({
      where: { patient_id: patientId },
      relations: ['created_by'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<CreateQuestionnaireDto>): Promise<Questionnaire> {
    await this.questionnaireRepo.update(id, updateData);
    return this.findOne(id);
  }

  async complete(id: string): Promise<Questionnaire> {
    await this.questionnaireRepo.update(id, {
      status: 'completed',
      completed_at: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.questionnaireRepo.delete(id);
  }

  /**
   * Generate PDF from questionnaire data
   */
  async generatePdf(id: string): Promise<Buffer> {
    const questionnaire = await this.findOne(id);
    if (!questionnaire) {
      throw new NotFoundException('Questionnaire not found');
    }

    this.logger.log(`Generating PDF for questionnaire ${id}`);

    // Load HTML template
    const templatePath = path.join(__dirname, '../../templates/questionnaire-pdf.html');
    let htmlContent = await fs.readFile(templatePath, 'utf-8');

    // Replace placeholders with actual data
    htmlContent = this.replacePlaceholders(htmlContent, questionnaire);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      this.logger.log(`PDF generated successfully for questionnaire ${id}`);
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Save PDF to filesystem and update questionnaire
   */
  async savePdf(id: string): Promise<string> {
    const pdfBuffer = await this.generatePdf(id);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate filename
    const filename = `questionnaire_${id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, filename);

    // Save PDF
    await fs.writeFile(filePath, pdfBuffer);

    // Update questionnaire record
    await this.questionnaireRepo.update(id, { pdf_path: filePath });

    this.logger.log(`PDF saved to ${filePath}`);
    return filePath;
  }

  /**
   * Replace placeholders in HTML template
   */
  private replacePlaceholders(html: string, questionnaire: Questionnaire): string {
    const basicInfo = questionnaire.basic_info || {};
    const pregnancyInfo = questionnaire.pregnancy_info || {};
    const healthHistory = questionnaire.health_history || {};
    const previousPregnancies = questionnaire.previous_pregnancies || [];

    // Helper to format date
    const formatDate = (date: any) => {
      if (!date) return 'N/A';
      try {
        return format(new Date(date), 'dd.MM.yyyy', { locale: cs });
      } catch {
        return date;
      }
    };

    // Helper to format value
    const formatValue = (value: any) => {
      if (value === null || value === undefined || value === '') return 'Neuvedeno';
      if (typeof value === 'boolean') return value ? 'Ano' : 'Ne';
      return value;
    };

    // Generate previous pregnancies HTML
    let previousPregnanciesHtml = '';
    if (previousPregnancies.length > 0) {
      previousPregnancies.forEach((preg: any, index: number) => {
        previousPregnanciesHtml += `
          <div class="pregnancy-item">
            <div class="pregnancy-number">Těhotenství ${index + 1}</div>
            <table>
              <tr><td>Rok:</td><td>${formatValue(preg.year)}</td></tr>
              <tr><td>Typ ukončení:</td><td>${formatValue(preg.outcome)}</td></tr>
              <tr><td>Týden:</td><td>${formatValue(preg.week)}</td></tr>
              <tr><td>Komplikace:</td><td>${formatValue(preg.complications)}</td></tr>
            </table>
          </div>
        `;
      });
    } else {
      previousPregnanciesHtml = '<p style="color: #999; padding: 15px;">Žádná předchozí těhotenství</p>';
    }

    // Replace all placeholders
    const replacements: Record<string, string> = {
      '{{patientName}}': `${formatValue(questionnaire.patient?.first_name)} ${formatValue(questionnaire.patient?.last_name)}`,
      '{{birthNumber}}': formatValue(questionnaire.patient?.birth_number),
      '{{birthDate}}': formatDate((questionnaire.patient as any)?.birth_date),
      '{{address}}': `${formatValue(basicInfo.street)}, ${formatValue(basicInfo.city)}, ${formatValue(basicInfo.postal_code)}`,
      '{{phone}}': formatValue(basicInfo.phone),
      '{{email}}': formatValue(basicInfo.email),
      '{{lastPeriod}}': formatDate(pregnancyInfo.last_period),
      '{{expectedDueDate}}': formatDate(pregnancyInfo.expected_due_date),
      '{{currentWeek}}': formatValue(pregnancyInfo.current_week),
      '{{conceptionMethod}}': formatValue(pregnancyInfo.conception_method),
      '{{numberOfFetuses}}': formatValue(pregnancyInfo.number_of_fetuses),
      '{{previousPregnancies}}': previousPregnanciesHtml,
      '{{chronicDiseases}}': formatValue(healthHistory.chronic_diseases),
      '{{medications}}': formatValue(healthHistory.medications),
      '{{allergies}}': formatValue(healthHistory.allergies),
      '{{surgeries}}': formatValue(healthHistory.surgeries),
      '{{familyHistory}}': formatValue(healthHistory.family_history),
      '{{additionalNotes}}': formatValue(questionnaire.additional_notes?.notes),
      '{{createdAt}}': formatDate(questionnaire.created_at),
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      html = html.replace(new RegExp(placeholder, 'g'), value);
    });

    return html;
  }

  /**
   * Generate unique token for public questionnaire access
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create draft questionnaire with public token and send email
   */
  async createPublicQuestionnaire(
    patientId: string,
    questionnaireType: 'pregnant' | 'gynecology' | 'ultrasound',
    userId: string,
  ): Promise<{ questionnaire: Questionnaire; publicUrl: string }> {
    // Load patient data - try both UUID (Profema) and INTEGER (Astraia)
    let patient: Patient | null = null;

    // First try as INTEGER (Astraia ID)
    const astraiaId = parseInt(patientId, 10);
    if (!isNaN(astraiaId)) {
      patient = await this.patientRepo.findOne({ where: { astraia_patient_id: astraiaId } });

      // If not found in Profema, load from Astraia and create in Profema
      if (!patient) {
        const astraiaPatient = await this.astraiaPatientRepo.findOne({ where: { id: astraiaId } });
        if (astraiaPatient) {
          this.logger.log(`Creating Profema record for Astraia patient ${astraiaId}`);
          patient = this.patientRepo.create({
            astraia_patient_id: astraiaId,
            first_name: astraiaPatient.other_names || '',
            last_name: astraiaPatient.name || '',
            birth_date: astraiaPatient.dob,
            birth_number: astraiaPatient.hospital_number || '',
            insurance_number: astraiaPatient.ohip || '',
            assigned_doctor_id: userId,
            is_active: true,
          });
          patient = await this.patientRepo.save(patient);
          this.logger.log(`Created Profema patient ${patient.id} for Astraia ID ${astraiaId}`);
        }
      }
    }

    // If not found, try as UUID (Profema ID)
    if (!patient) {
      try {
        patient = await this.patientRepo.findOne({ where: { id: patientId } });
      } catch (error) {
        // UUID format error, ignore
      }
    }

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Email is optional - receptionist can copy the link and send it manually
    this.logger.log(`Creating questionnaire for patient ${patientId}, email: ${patient.email || 'not provided'}`);

    // Generate token and expiration (7 days)
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create DRAFT questionnaire with pre-filled patient data
    const questionnaire = this.questionnaireRepo.create({
      patient_id: patient.id,
      created_by_user_id: userId,
      type: questionnaireType,
      status: 'draft',
      public_token: token,
      token_expires_at: expiresAt,
      token_used: false,
      // Pre-fill basic info from patient profile
      basic_info: {
        title: patient.title || '',
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        birth_number: patient.birth_number || '',
        address: patient.address || '',
        phone: patient.phone || '',
        email: patient.email || '',
        insurance_company: patient.insurance_company || '',
      },
      pregnancy_info: {},
      health_history: {},
      previous_pregnancies: {},
      additional_notes: {},
    });

    const saved = await this.questionnaireRepo.save(questionnaire);

    // Generate public URL
    const baseUrl = process.env.FRONTEND_URL || 'https://301.tkservis.cz';
    const publicUrl = `${baseUrl}/q/${token}`;

    this.logger.log(`Created public questionnaire for patient ${patientId}, token: ${token}, expires: ${expiresAt}`);

    return { questionnaire: saved, publicUrl };
  }

  /**
   * Get questionnaire by public token
   */
  async findByToken(token: string): Promise<Questionnaire> {
    const questionnaire = await this.questionnaireRepo.findOne({
      where: { public_token: token },
      relations: ['patient'],
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionnaire not found');
    }

    // Check if token is expired
    if (questionnaire.token_expires_at && new Date() > questionnaire.token_expires_at) {
      throw new BadRequestException('Token has expired');
    }

    // Check if token already used
    if (questionnaire.token_used) {
      throw new BadRequestException('This questionnaire has already been completed');
    }

    return questionnaire;
  }

  /**
   * Update questionnaire via public token
   */
  async updateByToken(token: string, updateData: Partial<CreateQuestionnaireDto>): Promise<Questionnaire> {
    const questionnaire = await this.findByToken(token);

    // Mark as completed and token as used
    await this.questionnaireRepo.update(questionnaire.id, {
      ...updateData,
      status: 'completed',
      completed_at: new Date(),
      token_used: true,
    });

    this.logger.log(`Questionnaire ${questionnaire.id} completed via token ${token}`);

    return this.findOne(questionnaire.id);
  }
}
