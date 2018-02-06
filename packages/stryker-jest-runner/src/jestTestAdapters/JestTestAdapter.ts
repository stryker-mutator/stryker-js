export default interface JestTestAdapter {
  run(config: Object, projectRoot: string): Promise<any>;
}