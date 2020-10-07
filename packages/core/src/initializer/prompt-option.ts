import { PackageInfo } from './PackageInfo';

interface PromptOption {
  name: string;
  pkg: PackageInfo | null;
}

export default PromptOption;
