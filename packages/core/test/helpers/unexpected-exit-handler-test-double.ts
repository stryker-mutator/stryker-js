import type {
  AsyncExitHandler,
  ExitHandler,
} from '../../src/unexpected-exit-handler.js';

export class UnexpectedExitHandlerTestDouble {
  private readonly exitHandlers: ExitHandler[] = [];
  private readonly asyncHandlers: AsyncExitHandler[] = [];

  public registerHandler(handler: ExitHandler): void {
    this.exitHandlers.push(handler);
  }

  public registerAsyncHandler(handler: AsyncExitHandler): void {
    this.asyncHandlers.push(handler);
  }

  public dispose(): void {
    this.exitHandlers.length = 0;
    this.asyncHandlers.length = 0;
  }

  public async triggerUnexpectedExit(): Promise<void> {
    await Promise.allSettled(this.asyncHandlers.map((handler) => handler()));
  }
}
