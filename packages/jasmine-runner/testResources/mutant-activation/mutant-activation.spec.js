describe('mutant-activation', () => {
  const staticActiveMutant = globalThis.__stryker2__ && globalThis.__stryker2__.activeMutant ?? null;

  it('should report active mutants', () => {
    const runtimeActiveMutant = globalThis.__stryker2__ && globalThis.__stryker2__.activeMutant ?? null;

    throw new Error(JSON.stringify({ staticActiveMutant, runtimeActiveMutant}));
  });
});
