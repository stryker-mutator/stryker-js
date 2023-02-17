import { Suite } from 'vitest';

export function collectTestName(suite: { name: string; suite?: Suite } | undefined): string {
  if (!suite) {
    return '';
  }
  return `${collectTestName(suite.suite)}${suite.name}`;
}
