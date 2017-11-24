export default interface ExpectMutation {
  (originalCode: string, ...expectedMutations: string[]): void;
}