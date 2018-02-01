import * as fs from 'mz/fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { getLogger } from 'log4js';
import { deleteDir } from './fileUtils';


export class TempDir {
  private readonly log = getLogger(TempDir.name);
  baseTempFolder: string;
  tempFolder: string;
  
  private constructor() { }

  initialize(tempDirName: string) {
    this.baseTempFolder = path.join(process.cwd(), tempDirName);
    this.tempFolder = path.join(this.baseTempFolder, this.random().toString());
    this.log.debug(`Using stryker temp folder ${this.baseTempFolder}`);
    mkdirp.sync(this.baseTempFolder);
    mkdirp.sync(this.tempFolder);
  }

  /**
   * Creates a new random folder with the specified prefix.
   * @param prefix The prefix.
   * @returns The path to the folder.
   */
  createRandomFolder(prefix: string): string {
    if (!this.baseTempFolder) {
      throw new Error('initialize() was not called!');
    }
    let dir = this.baseTempFolder + path.sep + prefix + this.random();
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
  copyFile(fromFilename: string, toFilename: string, instrumenter: NodeJS.ReadWriteStream | null): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let readStream: NodeJS.ReadableStream = fs.createReadStream(fromFilename, { encoding: 'utf8' });
      const writeStream = fs.createWriteStream(toFilename);
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
   * Deletes the Stryker-temp folder
   */
  clean() {
    if (!this.baseTempFolder) {
      throw new Error('initialize() was not called!');
    }
    this.log.debug(`Deleting stryker temp folder ${this.baseTempFolder}`);
    return deleteDir(this.baseTempFolder)
      .catch(() => this.log.info(`Failed to delete stryker temp folder ${this.baseTempFolder}`));
  }

  /**
   * Creates a random integer number.
   * @returns A random integer.
   */
  random(): number {
    return Math.ceil(Math.random() * 10000000);
  }

  private static _instance: TempDir;
  static instance() {
    if (!this._instance) {
      this._instance = new TempDir();
    }
    return this._instance;
  }
}