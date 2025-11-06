import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(@Body() createPatientDto: CreatePatientDto, @Request() req) {
    return this.patientsService.create(createPatientDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('assignedDoctorId') assignedDoctorId?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('source') source?: string,
  ) {
    // If source=astraia, load from Astraia database
    if (source === 'astraia') {
      return this.patientsService.findAllFromAstraia();
    }

    // If filters are provided, use advanced filtering
    if (status || assignedDoctorId || sort || page || limit) {
      return this.patientsService.findWithFilters({
        status,
        assignedDoctorId,
        sort,
        order,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      });
    }

    // Otherwise return all patients from Profema
    return this.patientsService.findAll();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.patientsService.searchPatients(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: CreatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
