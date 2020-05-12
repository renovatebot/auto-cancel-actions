import minimatch from 'minimatch';

export function isbranchAllowed(branch: string, patterns: string[]): boolean {
  return patterns.some((pattern) => minimatch(branch, pattern));
}
