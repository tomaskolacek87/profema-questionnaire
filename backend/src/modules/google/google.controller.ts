import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { GoogleService } from './google.service';

@Controller('google')
@UseGuards(JwtAuthGuard)
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post('upload-pdf')
  async uploadPdf(
    @Body() body: { pdfBuffer: string; fileName: string; patientName: string },
  ) {
    const buffer = Buffer.from(body.pdfBuffer, 'base64');
    const fileId = await this.googleService.uploadPdfToDrive(
      buffer,
      body.fileName,
      body.patientName,
    );
    return { fileId, message: 'PDF uploaded to Google Drive successfully' };
  }

  @Get('file-url/:fileId')
  async getFileUrl(@Param('fileId') fileId: string) {
    const url = await this.googleService.getFileUrl(fileId);
    return { url };
  }
}
