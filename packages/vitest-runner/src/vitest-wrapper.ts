import { createVitest } from 'vitest/node';

export type * from 'vitest/node';
export const vitestWrapper = {
  createVitest: createVitest,
};
