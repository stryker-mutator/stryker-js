
export interface EmptyCallback {
  (err?: NodeJS.ErrnoException | null): void;
}

export interface Callback<T> {
  (err: NodeJS.ErrnoException | null | undefined, arg: T | undefined): void;
}

export declare namespace webpack {

  interface FileStats {
    isFile: () => boolean;
    isDirectory: () => boolean;
    isBlockDevice: () => boolean;
    isCharacterDevice: () => boolean;
    isSymbolicLink: () => boolean;
    isFIFO: () => boolean;
    isSocket: () => boolean;
}

  /**
   * Grabbed from https://github.com/webpack/enhanced-resolve/blob/4a9488d1f0954351cbbee80fbf395688f853ef1f/lib/NodeJsInputFileSystem.js
   */
  interface InputFileSystem {
    stat(path: string, callback: Callback<FileStats>): void;
    readdir(path: string, callback: Callback<string[]>): void;

    readFile(path: string, options: { encoding: string; flag?: string; } | string, callback: Callback<string>): void;
    readFile(path: string, options: { encoding?: null; flag?: string; } | undefined | null, callback: Callback<Buffer>): void;
    readFile(path: string, options: { encoding?: string | null; flag?: string; } | string | undefined | null, callback: Callback<string | Buffer>): void;
    readFile(path: string, callback: Callback<Buffer>): void;

    readlink(path: string, callback: Callback<string>): void;

    statSync(path: string): FileStats;
    readdirSync(path: string): string[];

    readFileSync(path: string, encoding?: string): string;
    readlinkSync(path: string): string | Buffer;
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
    writeFile(path: string, data: any, options: { encoding?: string | null; mode?: number | string; flag?: string; } | string | undefined | null, callback: EmptyCallback): void;
    join(...paths: string[]): string;
  }
}