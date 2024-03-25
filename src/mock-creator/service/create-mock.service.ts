import { Injectable } from '@nestjs/common';
import { CustomerFakerService } from './customer-faker.service';
import { benchmark } from '../../benchmark-metrics/util/benchmark.helper';
import { CustomerEntity } from '../../benchmark-data/model/customer.entity';
import { LoggerService } from '../../logger/logger.service';
import { BenchmarkMetricsService } from '../../benchmark-metrics/service/benchmark-metrics.service';
import { BillEntity } from '../../benchmark-data/model/bill.entity';
import { BillsFakerService } from './bills-faker.service';

@Injectable()
export class CreateMockService {
  constructor(
    private readonly customerFakerService: CustomerFakerService,
    private readonly billFakerService: BillsFakerService,
    private readonly loggerService: LoggerService,
    private readonly benchmarkService: BenchmarkMetricsService,
  ) {}

  async createMockBills(amount: number, customerIds: string[]) {
    const entities = await benchmark<BillEntity[]>(
      `Create ${amount} mock bills`,
      this.billFakerService.createMockEntities.bind(this.billFakerService),
      this.benchmarkService.resultMap,
      amount,
      customerIds,
    );
    this.loggerService.log(`${entities.length} mock bill entities created`);
    return entities;
  }

  async createMockCustomers(amount: number) {
    this.loggerService.log(
      `Mock creation process for ${amount} customers started`,
    );

    const entities = await benchmark<CustomerEntity[]>(
      `Create ${amount} mock customers`,
      this.customerFakerService.createMockEntities.bind(
        this.customerFakerService,
      ),
      this.benchmarkService.resultMap,
      amount,
    );
    this.loggerService.log(`${entities.length} mock customer entities created`);
    return entities;
  }
}
