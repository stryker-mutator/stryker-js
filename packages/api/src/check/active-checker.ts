export interface ActiveChecker {
  setActiveChecker(checker: string): Promise<void>;
}
