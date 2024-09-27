/**
 * Wait `n` ticks. This allows async tasks to progress.
 * @param n The number of ticks to wait
 */
export async function tick(n = 1): Promise<void> {
  for (let i = 0; i < n; i++) {
    await nextTick();
  }
}

function nextTick() {
  return new Promise<void>((resolve) => {
    process.nextTick(() => resolve());
  });
}
