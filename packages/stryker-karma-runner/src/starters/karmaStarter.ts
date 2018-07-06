import { requireModule } from '../utils';

export async function start(): Promise<void> {
  // Make sure require karma from inside this function, that way it won't break if karma isn't installed and this file is required.
  const karma = requireModule('karma');
  await new karma.Server({
    configFile: require.resolve('./stryker-karma.conf'),
  }).start();
}