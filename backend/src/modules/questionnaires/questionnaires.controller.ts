import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';

@Controller('questionnaires')
@UseGuards(JwtAuthGuard)
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post()
  create(@Body() createQuestionnaireDto: CreateQuestionnaireDto, @Request() req) {
    return this.questionnairesService.create(createQuestionnaireDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.questionnairesService.findAll();
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.questionnairesService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionnairesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateQuestionnaireDto: CreateQuestionnaireDto) {
    return this.questionnairesService.update(id, updateQuestionnaireDto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.questionnairesService.complete(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionnairesService.remove(id);
  }
}
