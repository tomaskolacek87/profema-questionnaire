import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Ip,
  Headers,
} from '@nestjs/common';
import { MagicLinksService } from './magic-links.service';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@Controller('magic-links')
export class MagicLinksController {
  constructor(private readonly magicLinksService: MagicLinksService) {}

  /**
   * Generate magic link token (protected - only doctors)
   * POST /api/magic-links/generate
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateToken(@Body() dto: GenerateTokenDto, @Request() req) {
    return this.magicLinksService.generateToken(dto, req.user.userId);
  }

  /**
   * Validate token and get patient data (public)
   * GET /api/magic-links/validate/:token
   */
  @Get('validate/:token')
  async validateToken(
    @Param('token') token: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.magicLinksService.validateToken(token, ip, userAgent);
  }

  /**
   * Submit questionnaire via magic link (public)
   * POST /api/magic-links/submit/:token
   */
  @Post('submit/:token')
  async submitQuestionnaire(
    @Param('token') token: string,
    @Body() dto: SubmitQuestionnaireDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.magicLinksService.submitQuestionnaire(token, dto, ip, userAgent);
  }

  /**
   * Get token status for patient (protected - only doctors)
   * GET /api/magic-links/status/:patientId
   */
  @Get('status/:patientId')
  @UseGuards(JwtAuthGuard)
  async getTokenStatus(@Param('patientId') patientId: string) {
    return this.magicLinksService.getTokenStatus(patientId);
  }
}
