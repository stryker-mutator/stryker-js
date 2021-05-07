import { tokens } from '@stryker-mutator/api/plugin';
import { getLogger } from 'log4js';

export class Echo {
  private readonly logger = getLogger(Echo.name);

  public static inject = tokens('name');
  constructor(public name: string) {}

  public say(value: string): string {
    return `${this.name}: ${value}`;
  }

  public sayDelayed(value: string, delay: number): Promise<string> {
    return new Promise<string>((res) => {
      setTimeout(() => {
        res(this.say(`${value} (${delay} ms)`));
      }, delay);
    });
  }

  public exit(code: number): Promise<unknown> {
    process.exit(code);
    return new Promise(() => {
      /* Never resolve */
    });
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
    // eslint-disable-next-line no-constant-condition
    while (true) {
      arr.push(1);
    }
  }
}
