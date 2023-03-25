import { StrykerError } from '@stryker-mutator/util';
import { InjectionError } from 'typed-inject';

export class ConfigError extends StrykerError {}

export function retrieveCause(error: unknown): unknown {
  if (error instanceof InjectionError) {
    return error.cause;
  } else {
    return error;
  }
}
