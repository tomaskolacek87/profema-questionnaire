import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Appointment } from '../../entities/profema/appointment.entity';
import { Doctor } from '../../entities/profema/doctor.entity';
import { Patient } from '../../entities/profema/patient.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment, 'profemaConnection')
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Doctor, 'profemaConnection')
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(Patient, 'profemaConnection')
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { doctorId, patientId, startTime, endTime, ...rest } = createAppointmentDto;

    // Validate doctor exists
    const doctor = await this.doctorsRepository.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Validate patient if provided
    let patient = null;
    if (patientId) {
      patient = await this.patientsRepository.findOne({ where: { id: patientId } });
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${patientId} not found`);
      }
    }

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for conflicts
    const conflicts = await this.appointmentsRepository.find({
      where: {
        doctor: { id: doctorId },
        status: 'scheduled',
        startTime: LessThanOrEqual(end),
        endTime: MoreThanOrEqual(start),
      },
    });

    if (conflicts.length > 0) {
      throw new BadRequestException('Time slot conflicts with existing appointment');
    }

    // Create appointment
    const appointment = this.appointmentsRepository.create({
      ...rest,
      doctor,
      patient,
      startTime: start,
      endTime: end,
    });

    return await this.appointmentsRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      order: { startTime: 'ASC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: {
        startTime: Between(startDate, endDate),
      },
      order: { startTime: 'ASC' },
    });
  }

  async findByDoctor(doctorId: string, startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    const where: any = { doctor: { id: doctorId } };

    if (startDate && endDate) {
      where.startTime = Between(startDate, endDate);
    }

    return await this.appointmentsRepository.find({
      where,
      order: { startTime: 'ASC' },
    });
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: { patient: { id: patientId } },
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // If updating doctor
    if (updateAppointmentDto.doctorId && updateAppointmentDto.doctorId !== appointment.doctor.id) {
      const doctor = await this.doctorsRepository.findOne({
        where: { id: updateAppointmentDto.doctorId }
      });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${updateAppointmentDto.doctorId} not found`);
      }
      appointment.doctor = doctor;
    }

    // If updating patient
    if (updateAppointmentDto.patientId) {
      const patient = await this.patientsRepository.findOne({
        where: { id: updateAppointmentDto.patientId }
      });
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${updateAppointmentDto.patientId} not found`);
      }
      appointment.patient = patient;
    }

    // Update other fields
    Object.assign(appointment, updateAppointmentDto);

    return await this.appointmentsRepository.save(appointment);
  }

  async cancel(id: string, reason?: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason;
    return await this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.findByDateRange(today, tomorrow);
  }

  async getUpcomingAppointments(days: number = 7): Promise<Appointment[]> {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    return await this.findByDateRange(start, end);
  }
}
