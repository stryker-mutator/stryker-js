export default interface JestTestAdapter {
  run(config: Record<string, any>, projectRoot: string, fileNameUnderTest?: string): Promise<Jest.RunResult>;
}
