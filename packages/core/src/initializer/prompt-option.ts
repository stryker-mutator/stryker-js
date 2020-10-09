import { PackageInfo } from './package-info';

interface PromptOption {
  name: string;
  pkg: PackageInfo | null;
}

export default PromptOption;
