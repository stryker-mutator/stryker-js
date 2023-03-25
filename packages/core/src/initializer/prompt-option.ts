import { PackageInfo } from './package-info.js';

export interface PromptOption {
  name: string;
  pkg: PackageInfo | null;
}
