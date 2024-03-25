import { TimedExecution } from '../util/benchmark.helper';

export function getAverage(value: TimedExecution[]) {
  return value.reduce((acc, curr) => acc + curr.duration, 0) / value.length;
}

export function getPercentile90(value: TimedExecution[]) {
  if (value.length === 0) {
    return 0;
  }
  return value.toSorted((a, b) => a.duration - b.duration)[
    // element at 90% of the array and then correct for 0-based index
    Math.ceil(value.length * 0.9) - 1
  ].duration;
}

export function getMedian(value: TimedExecution[]) {
  if (value.length === 0) {
    return 0;
  }
  const middleIndex = Math.floor(value.length / 2);
  const values = value.toSorted((a, b) => a.duration - b.duration);

  if (value.length % 2 === 0) {
    return (
      (values[middleIndex - 1].duration + values[middleIndex].duration) / 2
    );
  } else {
    return values[middleIndex].duration;
  }
}
