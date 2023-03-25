describe('mutant-activation', () => {
  function getActiveMutant() {
    if (globalThis.__stryker2__ && globalThis.__stryker2__.activeMutant) {
      return globalThis.__stryker2__.activeMutant;
    }
    return null;
  }
  const staticActiveMutant = getActiveMutant();

  it('should report active mutants', () => {
    const runtimeActiveMutant = getActiveMutant();

    throw new Error(JSON.stringify({ staticActiveMutant, runtimeActiveMutant }));
  });
});
