import { Test, TestingModule } from '@nestjs/testing';
import { BenchmarkMetricsService } from './benchmark-metrics.service';

describe('BenchmarkMetricsService', () => {
  let service: BenchmarkMetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BenchmarkMetricsService],
    }).compile();

    service = module.get<BenchmarkMetricsService>(BenchmarkMetricsService);
  });

  it('should should return pretty printed results correctly', () => {
    expect(service).toBeDefined();
    const expectedAverage = 550;
    const expectedMedian = 550;
    const expected90thPercentile = 900;
    service.resultMap.set('method_1', [
      { iteration: '1', duration: 100 },
      { iteration: '2', duration: 1000 },
      { iteration: '3', duration: 900 },
      { iteration: '4', duration: 300 },
      { iteration: '5', duration: 600 },
      { iteration: '6', duration: 400 },
      { iteration: '7', duration: 200 },
      { iteration: '8', duration: 500 },
      { iteration: '9', duration: 700 },
      { iteration: '10', duration: 800 },
    ]);

    const actual = service.formatPrettyPrintableResults();
    expect(actual.length).toBe(1);

    const actualElement = actual[0];

    expect(actualElement.key).toBe('method_1');
    expect(actualElement.value.length).toBe(10);
    expect(actualElement.median).toBe(expectedMedian);
    expect(actualElement.percentile90).toBe(expected90thPercentile);
    expect(actualElement.average).toBe(expectedAverage);
  });
});
