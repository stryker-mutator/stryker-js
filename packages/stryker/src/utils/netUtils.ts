import * as getPortModule from 'get-port';

export const getPort: (options?: { port?: number, host?: string }) => Promise<number> = getPortModule as any;