import type Sinon from 'sinon';

/**
 * Wait `n` ticks. This allows async tasks to progress.
 * @param n The number of ticks to wait
 */
export async function tick(n = 1): Promise<void> {
  for (let i = 0; i < n; i++) {
    await nextTick();
  }
}

export function createFakeTick(clock: Sinon.SinonFakeTimers) {
  return async function fakeTick(n = 1) {
    const onGoingTick = tick(n);
    clock.tick(n);
    await onGoingTick;
  };
}

function nextTick() {
  return new Promise<void>((resolve) => {
    process.nextTick(() => resolve());
  });
}
