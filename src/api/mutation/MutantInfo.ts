import MutantStatus from './MutantStatus';

interface MutantInfo {
  location: ESTree.SourceLocation;
  fileName: string;
  mutatedNode: ESTree.Node;
  status?: MutantStatus;
  substitution?: string;
}


export default MutantInfo;