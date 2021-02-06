import { resolve } from 'path';

export function sleep(ms = 0): Promise<unknown> {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

export function resolveFromRoot(...pathSegments: string[]): string {
  return resolve(__dirname, '..', '..', '..', ...pathSegments);
}
