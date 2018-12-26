import { Stats } from 'enhanced-resolve';

export type EmptyCallback = (err?: NodeJS.ErrnoException | null) => void;

export type Callback<T> = (err: NodeJS.ErrnoException | null | undefined, arg?: T) => void;

export declare namespace webpack {

  /**
   * Grabbed from https://github.com/webpack/enhanced-resolve/blob/4a9488d1f0954351cbbee80fbf395688f853ef1f/lib/NodeJsInputFileSystem.js
   */
  interface InputFileSystem {
    readdir(path: string, callback: Callback<string[]>): void;
    readdirSync(path: string): string[];

    readFile(path: string, options: { encoding: string; flag?: string } | string, callback: Callback<string>): void;
    readFile(path: string, options: { encoding?: null; flag?: string } | undefined | null, callback: Callback<Buffer>): void;
    readFile(path: string, options: { encoding?: string | null; flag?: string } | string | undefined | null, callback: Callback<string | Buffer>): void;
    readFile(path: string, callback: Callback<Buffer>): void;

    readFileSync(path: string, encoding?: string): string;

    readlink(path: string, callback: Callback<string>): void;
    readlinkSync(path: string): string | Buffer;
    stat(path: string, callback: Callback<Stats>): void;

    statSync(path: string): Stats;
  }

  /**
   * Grabbed from https://github.com/webpack/webpack/blob/d18607395713ba08b2f562356375726030bbdd19/lib/node/NodeOutputFileSystem.js
   */
  interface OutputFileSystem {
    join(...paths: string[]): string;
    mkdir(name: string, callback: EmptyCallback): void;
    mkdirp(dir: string, opts: any, callback: Callback<string>): void;
    mkdirp(dir: string, callback: Callback<string>): void;
    rmdir(name: string, callback: EmptyCallback): void;
    unlink(name: string, callback: EmptyCallback): void;
    writeFile(path: string, data: any, callback: EmptyCallback): void;
    writeFile(path: string, data: any, options: { encoding?: string | null; flag?: string; mode?: number | string } | string | undefined | null, callback: EmptyCallback): void;
  }
}
