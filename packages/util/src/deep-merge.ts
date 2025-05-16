export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, any> ? DeepPartial<T[P]> : T[P];
};

/**
 *
 * @param defaults
 * @param overrides
 */
export function deepMerge<T>(defaults: T, overrides: DeepPartial<T>): void {
  Object.keys(overrides)
    .filter((key) => key !== '__proto__')
    .forEach((key) => {
      const defaultValue = (defaults as any)[key];
      const overrideValue = (overrides as any)[key];
      if (overrideValue !== undefined) {
        if (
          defaultValue === undefined ||
          typeof defaultValue !== 'object' ||
          typeof overrideValue !== 'object' ||
          Array.isArray(defaultValue)
        ) {
          (defaults as any)[key] = overrideValue;
        } else {
          deepMerge(defaultValue, overrideValue as DeepPartial<T>);
        }
      }
    });
}
