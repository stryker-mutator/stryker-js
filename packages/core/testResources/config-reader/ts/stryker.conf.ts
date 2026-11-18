import type { PartialStrykerOptions } from '@stryker-mutator/api/core';

const options = {
  valid: 'config',
  should: 'be',
  read: true,
  type: 'ts',
} satisfies PartialStrykerOptions;

export default options;
