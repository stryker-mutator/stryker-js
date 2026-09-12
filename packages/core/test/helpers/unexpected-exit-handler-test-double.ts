import type {
  ExitHandler,
  SyncExitHandler,
} from '../../src/unexpected-exit-handler.js';

export class UnexpectedExitHandlerTestDouble {
  private readonly exitHandlers: ExitHandler[] = [];
  private readonly syncExitHandlers: SyncExitHandler[] = [];

  public registerHandler(handler: ExitHandler): void {
    this.exitHandlers.push(handler);
  }

  public registerSyncHandler(handler: SyncExitHandler): void {
    this.syncExitHandlers.push(handler);
  }

  public dispose(): void {
    this.exitHandlers.length = 0;
    this.syncExitHandlers.length = 0;
  }

  public async triggerUnexpectedExit(): Promise<void> {
    this.syncExitHandlers.forEach((handler) => handler());
    await Promise.allSettled(this.exitHandlers.map((handler) => handler()));
  }
}
