import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    if (doctorId) {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      return this.appointmentsService.findByDoctor(doctorId, start, end);
    }

    if (startDate && endDate) {
      return this.appointmentsService.findByDateRange(
        new Date(startDate),
        new Date(endDate),
      );
    }

    return this.appointmentsService.findAll();
  }

  @Get('today')
  getTodayAppointments() {
    return this.appointmentsService.getTodayAppointments();
  }

  @Get('upcoming')
  getUpcomingAppointments(@Query('days') days?: string) {
    const daysCount = days ? parseInt(days, 10) : 7;
    return this.appointmentsService.getUpcomingAppointments(daysCount);
  }

  @Get('doctor/:doctorId')
  findByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.appointmentsService.findByDoctor(doctorId, start, end);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.appointmentsService.cancel(id, reason);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
