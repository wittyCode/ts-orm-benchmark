import { Controller, Get } from '@nestjs/common';
import { BenchmarkMetricsService } from '../service/benchmark-metrics.service';

@Controller('metrics')
export class BenchmarkMetricsController {
  constructor(private readonly benchmarkService: BenchmarkMetricsService) {}

  @Get()
  getResults() {
    return this.benchmarkService.formatPrettyPrintableResults();
  }
}
