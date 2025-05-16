import { Resource } from './pool.js';

export abstract class ResourceDecorator<T extends Resource>
  implements Resource
{
  protected innerResource: T;

  constructor(private readonly producer: () => T) {
    this.innerResource = producer();
  }

  public async init(): Promise<void> {
    await this.innerResource.init?.();
  }

  public async dispose(): Promise<void> {
    await this.innerResource.dispose?.();
  }
  /**
   * Disposes the current test runner and creates a new one
   * To be used in decorators that need recreation.
   */
  protected async recover(): Promise<void> {
    await this.dispose();
    this.innerResource = this.producer();
    return this.init();
  }
}
