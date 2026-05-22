import type { ExitHandler } from '../../src/unexpected-exit-handler.js';

export class UnexpectedExitHandlerTestDouble {
  private readonly exitHandlers: ExitHandler[] = [];

  public registerHandler(handler: ExitHandler): void {
    this.exitHandlers.push(handler);
  }

  public dispose(): void {
    this.exitHandlers.length = 0;
  }

  public async triggerUnexpectedExit(): Promise<void> {
    await Promise.allSettled(this.exitHandlers.map((handler) => handler()));
  }
}
