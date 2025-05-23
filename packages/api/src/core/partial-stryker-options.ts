import { StrykerOptions } from '../../src-generated/stryker-core.js';

/**
 * When configuring stryker, every option is optional
 * Including deep properties like `dashboard.project`.
 * That's why we use a `DeepPartial` mapped type here.
 */
export type PartialStrykerOptions = DeepPartial<StrykerOptions>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, any>
    ? DeepPartial<T[P]> | undefined
    : T[P];
};
