import { karma } from '../karma-wrapper';

export function start(): Promise<number> {
  return new Promise((res, rej) => {
    new karma.Server(
      {
        configFile: require.resolve('./stryker-karma.conf'),
      },
      res
    )
      .start()
      .catch(rej);
  });
}
