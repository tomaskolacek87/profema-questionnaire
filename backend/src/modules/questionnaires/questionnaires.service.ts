import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '@entities/profema/questionnaire.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire, 'profemaConnection')
    private questionnaireRepo: Repository<Questionnaire>,
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
}
