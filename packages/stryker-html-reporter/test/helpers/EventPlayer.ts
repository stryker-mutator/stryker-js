import * as path from 'path';
import { Reporter } from 'stryker-api/report';
import * as fs from 'mz/fs';

const eventName = (filename: string) =>
  filename.substring(filename.indexOf('-') + 1, filename.indexOf('.'));

export default class EventPlayer {
  constructor(private fromDirectory: string) { }

  replay(target: Reporter) {
    const files = fs.readdirSync(this.fromDirectory).sort();
    return Promise.all(files.map(
      filename => fs.readFile(path.join(this.fromDirectory, filename), 'utf8').then(content => ({
        name: eventName(filename),
        content: JSON.parse(content)
      }))
    )).then(events => events.forEach(event => (target as any)[event.name](event.content)));
  }
}
