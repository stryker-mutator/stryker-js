import { fileURLToPath } from 'url';
import path from 'path';

export function sleep(ms = 0): Promise<unknown> {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

export function resolveFromRoot(...pathSegments: string[]): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', ...pathSegments);
}
