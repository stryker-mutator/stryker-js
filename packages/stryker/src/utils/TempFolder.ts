import { fsAsPromised } from '@stryker-mutator/util';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { getLogger } from 'stryker-api/logging';
import { deleteDir } from './fileUtils';

export class TempFolder {
  public static instance() {
    if (!this._instance) {
      this._instance = new TempFolder();
    }

    return this._instance;
  }

  private static _instance: TempFolder;
  public baseTempFolder: string;
  public tempFolder: string;
  private readonly log = getLogger(TempFolder.name);

  /**
   * Deletes the Stryker-temp folder
   */
  public clean() {
    if (!this.baseTempFolder) {
      throw new Error('initialize() was not called!');
    }
    this.log.debug(`Deleting stryker temp folder ${this.baseTempFolder}`);

    return deleteDir(this.baseTempFolder)
      .catch(() => this.log.info(`Failed to delete stryker temp folder ${this.baseTempFolder}`));
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
      readStream.on('end', resolve);
    });
  }

  /**
   * Creates a new random folder with the specified prefix.
   * @param prefix The prefix.
   * @returns The path to the folder.
   */
  public createRandomFolder(prefix: string): string {
    if (!this.baseTempFolder) {
      throw new Error('initialize() was not called!');
    }
    const dir = this.baseTempFolder + path.sep + prefix + this.random();
    mkdirp.sync(dir);

    return dir;
  }

  public initialize(tempDirName = '.stryker-tmp') {
    this.baseTempFolder = path.join(process.cwd(), tempDirName);
    this.tempFolder = path.join(this.baseTempFolder, this.random().toString());
    mkdirp.sync(this.baseTempFolder);
    mkdirp.sync(this.tempFolder);
  }

  /**
   * Creates a random integer number.
   * @returns A random integer.
   */
  public random(): number {
    return Math.ceil(Math.random() * 10000000);
  }
}
