import fs from 'fs';

import { Task } from '@stryker-mutator/util';
import { mergeMap, Subject } from 'rxjs';
import { Disposable } from 'typed-inject';

import { MAX_CONCURRENT_FILE_IO } from '../utils/file-utils';

class FileSystemAction<TOut> {
  private readonly task = new Task<TOut>();

  /**
   * @param input The input to the ask
   * @param work The task, where a resource and input is presented
   */
  constructor(private readonly work: () => Promise<TOut>) {}

  public async execute() {
    try {
      const output = await this.work();
      this.task.resolve(output);
    } catch (err) {
      this.task.reject(err);
    }
  }
}

export class FileSystem implements Disposable {
  private readonly todoSubject = new Subject<FileSystemAction<any>>();
  private readonly subscription = this.todoSubject
    .pipe(
      mergeMap(async (action) => {
        await action.execute();
      }, MAX_CONCURRENT_FILE_IO)
    )
    .subscribe();

  public async dispose(): Promise<void> {
    this.subscription.unsubscribe();
  }

  public readonly readFile = this.forward('readFile');
  public readonly copyFile = this.forward('copyFile');
  public readonly writeFile = this.forward('writeFile');

  private forward<TMethod extends keyof typeof fs.promises>(method: TMethod): typeof fs.promises[TMethod] {
    return (...args: any[]) => this.todoSubject.next(new FileSystemAction(() => (fs.promises[method] as any)(...args))) as any;
  }
}
