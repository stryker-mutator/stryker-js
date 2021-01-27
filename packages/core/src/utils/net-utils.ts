import getPort from 'get-port';

/**
 * A wrapper around `getPort` for testing purposes
 */
export const getFreePort = getPort;

export function isOK(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}
