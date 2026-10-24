declare const x: unknown;

/**
 * @see https://github.com/stryker-mutator/stryker-js/issues/6208
 */
export const config = { debug: false, name: 'stryker' } as const;

/**
 * @see https://github.com/stryker-mutator/stryker-js/issues/6208
 */
export const satisfied = { debug: false } satisfies Record<string, boolean>;

/**
 * @see https://github.com/stryker-mutator/stryker-js/issues/6208
 */
export const legacyConfig = <Record<string, boolean>>{ debug: false };

/**
 * @see https://github.com/stryker-mutator/stryker-js/issues/6149
 */
export const asserted = x satisfies string extends string ? true : false;
