import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';

/**
 * Public questionnaire endpoints - NO AUTHENTICATION required
 * Used for patients filling out questionnaires via email link
 */
@Controller('questionnaires/public')
export class QuestionnairesPublicController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  /**
   * Get questionnaire by public token
   * No authentication required - token validates access
   */
  @Get(':token')
  async getByToken(@Param('token') token: string) {
    return this.questionnairesService.findByToken(token);
  }

  /**
   * Update questionnaire by public token
   * No authentication required - token validates access
   */
  @Put(':token')
  async updateByToken(
    @Param('token') token: string,
    @Body() updateQuestionnaireDto: CreateQuestionnaireDto,
  ) {
    return this.questionnairesService.updateByToken(token, updateQuestionnaireDto);
  }
}
