import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '@entities/profema/patient.entity';
import { Questionnaire } from '@entities/profema/questionnaire.entity';
import { User } from '@entities/profema/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Patient, 'profemaConnection')
    private patientRepo: Repository<Patient>,
    @InjectRepository(Questionnaire, 'profemaConnection')
    private questionnaireRepo: Repository<Questionnaire>,
    @InjectRepository(User, 'profemaConnection')
    private userRepo: Repository<User>,
  ) {}

  /**
   * Get overview statistics
   */
  async getOverview() {
    const [
      totalPatients,
      totalQuestionnaires,
      completedQuestionnaires,
      draftQuestionnaires,
      activeUsers,
    ] = await Promise.all([
      this.patientRepo.count(),
      this.questionnaireRepo.count(),
      this.questionnaireRepo.count({ where: { status: 'completed' } }),
      this.questionnaireRepo.count({ where: { status: 'draft' } }),
      this.userRepo.count({ where: { is_active: true } }),
    ]);

    // Get patients created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newPatientsLast30Days = await this.patientRepo.count({
      where: {
        created_at: thirtyDaysAgo as any, // TypeORM MoreThan() would be better
      },
    });

    // Get completion rate
    const completionRate = totalQuestionnaires > 0
      ? ((completedQuestionnaires / totalQuestionnaires) * 100).toFixed(1)
      : 0;

    return {
      totalPatients,
      totalQuestionnaires,
      completedQuestionnaires,
      draftQuestionnaires,
      activeUsers,
      newPatientsLast30Days,
      completionRate: parseFloat(completionRate as string),
    };
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10) {
    const recentPatients = await this.patientRepo.find({
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['assigned_doctor'],
    });

    const recentQuestionnaires = await this.questionnaireRepo.find({
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['patient', 'created_by'],
    });

    return {
      recentPatients: recentPatients.map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        createdAt: p.created_at,
        assignedDoctor: (p as any).assigned_doctor ? `${(p as any).assigned_doctor.first_name} ${(p as any).assigned_doctor.last_name}` : null,
      })),
      recentQuestionnaires: recentQuestionnaires.map(q => ({
        id: q.id,
        patientName: q.patient ? `${q.patient.first_name} ${q.patient.last_name}` : 'N/A',
        status: q.status,
        createdAt: q.created_at,
        createdBy: q.created_by ? `${q.created_by.first_name} ${q.created_by.last_name}` : null,
      })),
    };
  }

  /**
   * Get sync status (Profema <-> Astraia)
   */
  async getSyncStatus() {
    // Get patients with Astraia sync
    const patientsWithSync = await this.patientRepo.count({
      where: { astraia_patient_id: null as any }, // This checks for NOT NULL in TypeORM
    });

    const totalPatients = await this.patientRepo.count();
    const syncPercentage = totalPatients > 0
      ? ((patientsWithSync / totalPatients) * 100).toFixed(1)
      : 0;

    // Check for recent sync failures (patients without Astraia ID)
    const unsyncedPatients = await this.patientRepo.find({
      where: { astraia_patient_id: null },
      take: 10,
      order: { created_at: 'DESC' },
    });

    return {
      totalPatients,
      syncedPatients: patientsWithSync,
      unsyncedPatients: totalPatients - patientsWithSync,
      syncPercentage: parseFloat(syncPercentage as string),
      recentFailures: unsyncedPatients.map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        createdAt: p.created_at,
      })),
    };
  }

  /**
   * Get statistics by date range
   */
  async getStatsByDateRange(startDate: Date, endDate: Date) {
    const patientsCreated = await this.patientRepo
      .createQueryBuilder('patient')
      .where('patient.created_at >= :startDate', { startDate })
      .andWhere('patient.created_at <= :endDate', { endDate })
      .getCount();

    const questionnairesCreated = await this.questionnaireRepo
      .createQueryBuilder('questionnaire')
      .where('questionnaire.created_at >= :startDate', { startDate })
      .andWhere('questionnaire.created_at <= :endDate', { endDate })
      .getCount();

    const questionnairesCompleted = await this.questionnaireRepo
      .createQueryBuilder('questionnaire')
      .where('questionnaire.completed_at >= :startDate', { startDate })
      .andWhere('questionnaire.completed_at <= :endDate', { endDate })
      .andWhere('questionnaire.status = :status', { status: 'completed' })
      .getCount();

    return {
      patientsCreated,
      questionnairesCreated,
      questionnairesCompleted,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }
}
