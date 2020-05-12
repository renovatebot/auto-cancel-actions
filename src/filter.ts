import micromatch from 'micromatch';

export function isbranchAllowed(branch: string, patterns: string[]): boolean {
  return micromatch.isMatch(branch, patterns);
}
