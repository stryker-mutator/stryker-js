import { Stats } from 'enhanced-resolve';

export type EmptyCallback = (err?: NodeJS.ErrnoException | null) => void;

export type Callback<T> = (err: NodeJS.ErrnoException | null | undefined, arg?: T) => void;

export declare namespace webpack {
  /**
   * Grabbed from https://github.com/webpack/enhanced-resolve/blob/4a9488d1f0954351cbbee80fbf395688f853ef1f/lib/NodeJsInputFileSystem.js
   */
  interface InputFileSystem {
    stat(path: string, callback: Callback<Stats>): void;
    readdir(path: string, callback: Callback<string[]>): void;

    readFile(path: string, options: { encoding: string; flag?: string } | string, callback: Callback<string>): void;
    readFile(path: string, options: { encoding?: null; flag?: string } | undefined | null, callback: Callback<Buffer>): void;
    readFile(
      path: string,
      options: { encoding?: string | null; flag?: string } | string | undefined | null,
      callback: Callback<string | Buffer>
    ): void;
    readFile(path: string, callback: Callback<Buffer>): void;

    readlink(path: string, callback: Callback<string>): void;

    statSync(path: string): Stats;
    readdirSync(path: string): string[];

    readFileSync(path: string, encoding?: string): string | Buffer;
    readlinkSync(path: string): string;
  }

  /**
   * Grabbed from https://github.com/webpack/webpack/blob/d18607395713ba08b2f562356375726030bbdd19/lib/node/NodeOutputFileSystem.js
   */
  interface OutputFileSystem {
    mkdirp(dir: string, opts: any, callback: Callback<string>): void;
    mkdirp(dir: string, callback: Callback<string>): void;
    rmdir(name: string, callback: EmptyCallback): void;
    mkdir(name: string, callback: EmptyCallback): void;
    unlink(name: string, callback: EmptyCallback): void;
    writeFile(path: string, data: any, callback: EmptyCallback): void;
    writeFile(
      path: string,
      data: any,
      options: { encoding?: string | null; mode?: number | string; flag?: string } | string | undefined | null,
      callback: EmptyCallback
    ): void;
    join(...paths: string[]): string;
  }
}
