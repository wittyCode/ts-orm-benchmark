import { Injectable } from '@nestjs/common';
import { TimedExecution } from '../util/benchmark.helper';
import { getAverage, getMedian, getPercentile90 } from './math.helpers';

/*
  This service is used to store the results of the benchmarks. It is a simple
  map that stores the results of the benchmarks. The key is the name of the
  benchmark and the value is an array of TimedExecution objects. The
  TimedExecution object contains the time it took to run the benchmark and the
  number of iterations it ran.
 */
@Injectable()
export class BenchmarkMetricsService {
  public resultMap: Map<string, TimedExecution[]>;

  constructor() {
    this.resultMap = new Map<string, TimedExecution[]>();
  }

  /**
   * pretty print the results of the benchmarks, to
   * a) convert Map type correctly to printable object and
   * b) calculate average, median and 90th percentile
   */
  formatPrettyPrintableResults() {
    return [...this.resultMap.entries()].map(([key, value]) => {
      return {
        key,
        value,
        average: getAverage(value),
        median: getMedian(value),
        percentile90: getPercentile90(value),
      };
    });
  }
}
