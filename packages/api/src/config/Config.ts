import { StrykerOptions } from '../../core';
import { PartialStrykerOptions } from '../../core';

/**
 * @deprecated Use `StrykerOptions` instead
 */
export default interface Config extends StrykerOptions {
  set(newConfig: PartialStrykerOptions): void;
}
