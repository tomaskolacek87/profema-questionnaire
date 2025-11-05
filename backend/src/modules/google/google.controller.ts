import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { GoogleService } from './google.service';

@Controller('google')
@UseGuards(JwtAuthGuard)
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post('upload/:questionnaireId')
  async uploadQuestionnaire(@Param('questionnaireId') questionnaireId: string) {
    const pdfPath = await this.googleService.generatePdfFromQuestionnaire(questionnaireId);
    const fileId = await this.googleService.uploadPdfToDrive(pdfPath, `questionnaire_${questionnaireId}.pdf`);
    return { fileId, message: 'PDF uploaded to Google Drive' };
  }

  @Get('auth/callback')
  async handleCallback() {
    // TODO: Implement OAuth callback
    return { message: 'OAuth callback - not implemented yet' };
  }
}
