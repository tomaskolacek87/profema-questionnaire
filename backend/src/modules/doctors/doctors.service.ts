import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../../entities/profema/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor, 'profemaConnection')
    private doctorsRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const doctor = this.doctorsRepository.create(createDoctorDto);
    return await this.doctorsRepository.save(doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return await this.doctorsRepository.find({
      where: { isActive: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findAllIncludingInactive(): Promise<Doctor[]> {
    return await this.doctorsRepository.find({
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);
    Object.assign(doctor, updateDoctorDto);
    return await this.doctorsRepository.save(doctor);
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.findOne(id);
    doctor.isActive = false;
    await this.doctorsRepository.save(doctor);
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.doctorsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }

  async getAvailableSlots(
    doctorId: string,
    date: Date,
  ): Promise<{ start: Date; end: Date }[]> {
    const doctor = await this.findOne(doctorId);
    const dayName = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    if (!doctor.workingHours || !doctor.workingHours[dayName]) {
      return [];
    }

    // TODO: Implement logic to calculate available slots based on working hours and existing appointments
    // For now, return empty array
    return [];
  }
}
