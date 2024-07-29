import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';

export class Echo {
  public static inject = tokens(commonTokens.logger, commonTokens.options, commonTokens.fileDescriptions);

  public readonly testRunnerName: string;

  constructor(
    private readonly logger: Logger,
    options: StrykerOptions,
    private readonly fileDescriptions: FileDescriptions,
  ) {
    this.testRunnerName = options.testRunner;
  }

  public say(value: string): string {
    return `${this.testRunnerName}: ${value}`;
  }

  public sayDelayed(value: string, delay: number): Promise<string> {
    return new Promise<string>((res) => {
      setTimeout(() => {
        res(this.say(`${value} (${delay} ms)`));
      }, delay);
    });
  }

  public echoFiles(): FileDescriptions {
    return this.fileDescriptions;
  }

  public exit(code: number): Promise<unknown> {
    process.exit(code);
  }

  public warning(): void {
    process.emitWarning('Foo warning');
  }

  public cwd(): string {
    return process.cwd();
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }

  public trace(message: string): void {
    this.logger.trace(message);
  }

  public reject(error: string): Promise<never> {
    return Promise.reject(new Error(error));
  }

  public stdout(...args: string[]): void {
    args.forEach((arg) => console.log(arg));
  }

  public stderr(...args: string[]): void {
    args.forEach((arg) => console.error(arg));
  }

  public memoryLeak(): void {
    const arr: number[] = [];

    while (true) {
      arr.push(1);
    }
  }
}
