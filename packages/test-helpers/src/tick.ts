import { promisify } from 'util';

/**
 * Wait `n` ticks. This allows async tasks to progress.
 * @param n The number of ticks to wait
 */
export async function tick(n = 1): Promise<void> {
  const nextTickAsPromised = promisify(process.nextTick);
  for await (const _ of Array.from({ length: n })) {
    await nextTickAsPromised();
  }
}
