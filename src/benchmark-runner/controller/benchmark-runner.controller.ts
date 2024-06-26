import { Controller, Get, Param } from '@nestjs/common';
import {
  BenchmarkOrchestratorService,
  BenchmarkType,
} from '../service/benchmark-orchestrator.service';

@Controller('benchmark-runner')
export class BenchmarkRunnerController {
  constructor(
    private readonly benchmarkOrchestratorService: BenchmarkOrchestratorService,
  ) {}

  @Get(':dbDriver/reset')
  async resetBenchmark(@Param('dbDriver') dbDriver: BenchmarkType) {
    await this.benchmarkOrchestratorService.resetBenchmark(dbDriver);
    return { status: 'Benchmark reset!' };
  }

  @Get(':dbDriver/insert/:amount')
  async startInsertBenchmark(
    @Param('amount') amount: number,
    @Param('dbDriver') dbDriver: BenchmarkType,
  ) {
    const duration = await this.benchmarkOrchestratorService.runWriteBenchmark(
      dbDriver,
      amount,
    );
    return {
      duration,
      size: amount,
    };
  }

  // TODO: make batch size parameter
  @Get(':dbDriver/select/')
  async startReadBenchmark(@Param('dbDriver') dbDriver: BenchmarkType) {
    const duration =
      await this.benchmarkOrchestratorService.runReadBenchmark(dbDriver);
    return {
      duration,
    };
  }
}
