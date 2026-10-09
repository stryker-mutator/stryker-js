export { StrykerCli } from './stryker-cli.js';
import { Stryker } from './stryker.js';
export { Stryker };

// Export babel's NodePath so they can be used when declaring ignorer plugins
export type { babel } from '@stryker-mutator/instrumenter';

// One default export for backward compatibility
export default Stryker;
