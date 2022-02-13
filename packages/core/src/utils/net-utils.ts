import getPort from 'get-port';

export const netUtils = {
  /**
   * A wrapper around `getPort` for testing purposes
   */
  getFreePort: getPort,
};
