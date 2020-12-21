import { resolve } from 'path';

export function sleep(ms = 0) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

export function resolveFromRoot(...pathSegments: string[]) {
  return resolve(__dirname, '..', '..', ...pathSegments);
}
