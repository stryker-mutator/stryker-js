import { requireResolve } from '@stryker-mutator/util';

/**
 * The local karma export to be used inside this plugin
 */
export const karma = requireResolve('karma') as typeof import('karma');
