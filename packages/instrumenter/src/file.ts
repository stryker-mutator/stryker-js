import { FileDescription } from '@stryker-mutator/api/core';

export interface File extends FileDescription {
  name: string;
  content: string;
}
