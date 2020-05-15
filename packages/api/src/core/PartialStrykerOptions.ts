import { StrykerOptions } from '../../core';

/**
 * When configuring stryker, every option is optional
 * Including deep properties like `dashboard.project`.
 * That's why we use a `DeepPartial` mapped type here.
 */
export type PartialStrykerOptions = DeepPartial<StrykerOptions>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> | undefined : T[P];
};
