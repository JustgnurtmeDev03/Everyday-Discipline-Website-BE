import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  async checkHealth() {
    const details = await this.healthService.getHealthStatus();
    const overall = Object.values(details).every((s) => s === 'up')
      ? 'healthy'
      : 'unhealthy';
    return { status: overall, details };
  }
}
