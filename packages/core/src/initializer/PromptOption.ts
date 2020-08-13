import { PackageInfo } from './PackageInfo';

export interface PromptOption {
  name: string;
  pkg: PackageInfo | null;
}
