import { Location, Range } from "stryker-api/core";
import { RunResult, TestResult } from "stryker-api/test_runner";

export default class Mutant {

    private mutatedCode: string;
    /**
   * @param mutatorName - The name of the Mutator which created this mutant.
   * @param filename - The name of the file which was mutated, including the path.
   * @param originalCode - The original content of the file which has not been mutated.
   * @param replacement - The mutated code which will replace a part of the originalCode.
   * @param location - The location of the code to be mutated - line and column based
   * @param range - The location of the code to be mutated - index based
   */
  constructor(public mutatorName: string, public filename: string, private originalCode: string, public replacement: string, public location: Location, public range: Range) {
      this.mutatedCode = this.originalCode.slice(0, this.range[0]) + replacement  + this.originalCode.slice(this.range[1]);
  }

  public getMutatedCode(): string {
      return this.mutatedCode;
  }
}