/*
  This file contains helper functions for benchmarking.
  And a class to store the results of the benchmarking.
 */

export type TimedExecution = {
  iteration: string;
  duration: number;
};

export async function benchmark<T>(
  tag: string,
  asyncFn: (...params: any) => Promise<T>,
  resultMap: Map<string, TimedExecution[]>,
  // TODO: make fnParams also typed?
  // TODO: check if ...args works as well
  ...fnParams
): Promise<T> {
  const start = performance.now();
  const result = await asyncFn(...fnParams);
  const end = performance.now();
  const duration = end - start;

  const iteration = resultMap.get(tag)?.length + 1 || 1;

  resultMap.get(tag)?.push({ iteration: `iteration ${iteration}`, duration }) ||
    resultMap.set(tag, [{ iteration: `iteration ${iteration}`, duration }]);

  return result;
}
