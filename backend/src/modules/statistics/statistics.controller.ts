import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  getOverview() {
    return this.statisticsService.getOverview();
  }

  @Get('recent-activity')
  getRecentActivity(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.statisticsService.getRecentActivity(limitNum);
  }

  @Get('sync-status')
  getSyncStatus() {
    return this.statisticsService.getSyncStatus();
  }

  @Get('date-range')
  getStatsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.statisticsService.getStatsByDateRange(start, end);
  }
}
