import * as path from 'path';
import { Reporter } from 'stryker-api/report';
import { fsAsPromised } from '@stryker-mutator/util';

const eventName = (filename: string) =>
  filename.substring(filename.indexOf('-') + 1, filename.indexOf('.'));

export default class EventPlayer {
  constructor(private readonly fromDirectory: string) { }

  public replay(target: Reporter) {
    const files = fsAsPromised.readdirSync(this.fromDirectory).sort();
    return Promise.all(files.map(
      filename => fsAsPromised.readFile(path.join(this.fromDirectory, filename), 'utf8').then(content => ({
        content: JSON.parse(this.replacePathSeparator(content)),
        name: eventName(filename)
      }))
    )).then(events => events.forEach(event => (target as any)[event.name](event.content)));
  }

  private replacePathSeparator(content: string) {
    if (path.sep === '/') {
      return content.replace(/\\\\/g, path.sep);
    } else {
      return content;
    }
  }
}
