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
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
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

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.questionnairesService.generatePdf(id);
    res.set({
      'Content-Disposition': `attachment; filename="questionnaire_${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}
