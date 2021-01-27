import { PackageInfo } from './package-info';

export interface PromptOption {
  name: string;
  pkg: PackageInfo | null;
}
