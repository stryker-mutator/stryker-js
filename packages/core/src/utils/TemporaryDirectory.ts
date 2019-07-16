import { Disposable } from 'typed-inject';
import { fsAsPromised } from '@stryker-mutator/util';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { getLogger } from 'log4js';
import { deleteDir } from './fileUtils';

export class TemporaryDirectory implements Disposable {
  private readonly log = getLogger(TemporaryDirectory.name);
  public baseTemporaryDirectory: string;
  public temporaryDirectory: string;

  private constructor() { }

  public initialize(tempDirName = '.stryker-tmp') {
    this.baseTemporaryDirectory = path.join(process.cwd(), tempDirName);
    this.temporaryDirectory = path.join(this.baseTemporaryDirectory, this.random().toString());
    mkdirp.sync(this.baseTemporaryDirectory);
    mkdirp.sync(this.temporaryDirectory);
  }

  /**
   * Creates a new random directory with the specified prefix.
   * @param prefix The prefix.
   * @returns The path to the directory.
   */
  public createRandomDirectory(prefix: string): string {
    if (!this.baseTemporaryDirectory) {
      throw new Error('initialize() was not called!');
    }
    const dir = this.baseTemporaryDirectory + path.sep + prefix + this.random();
    mkdirp.sync(dir);
    return dir;
  }

  /**
   * Copies a file.
   * @param fromFilename The path to the existing file.
   * @param toFilename The path to copy the file to.
   * @param instrumenter An optional additional instrumenter to stream the file through
   * @returns A promise to eventually copy the file.
   */
  public copyFile(fromFilename: string, toFilename: string, instrumenter: NodeJS.ReadWriteStream | null): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let readStream: NodeJS.ReadableStream = fsAsPromised.createReadStream(fromFilename, { encoding: 'utf8' });
      const writeStream = fsAsPromised.createWriteStream(toFilename);
      readStream.on('error', reject);
      writeStream.on('error', reject);
      if (instrumenter) {
        readStream = readStream.pipe(instrumenter);
      }
      readStream.pipe(writeStream);
      readStream.on('end', () => resolve());
    });
  }

  /**
   * Deletes the Stryker-temp directory
   */
  public clean() {
    if (!this.baseTemporaryDirectory) {
      throw new Error('initialize() was not called!');
    }
    this.log.debug(`Deleting stryker temp directory ${this.baseTemporaryDirectory}`);
    return deleteDir(this.baseTemporaryDirectory)
      .catch(() => this.log.info(`Failed to delete stryker temp directory ${this.baseTemporaryDirectory}`));
  }

  /**
   * Creates a random integer number.
   * @returns A random integer.
   */
  public random(): number {
    return Math.ceil(Math.random() * 10000000);
  }

  public async dispose(): Promise<void> {
    await TemporaryDirectory.instance().clean();
  }

  private static _instance: TemporaryDirectory;
  public static instance() {
    if (!this._instance) {
      this._instance = new TemporaryDirectory();
    }
    return this._instance;
  }
}
