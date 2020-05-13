declare module 'enhanced-resolve' {
  export interface Stats {
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
  }

  type Callback<T> = (err: NodeJS.ErrnoException | null | undefined, arg?: T) => void;

  export interface AbstractInputFileSystem {
    purge?(what?: string | string[]): void;
    readdir(path: string, callback: (err: NodeJS.ErrnoException, files: string[]) => void): void;
    readdirSync(path: string): string[];
    readFile(
      filename: string,
      encoding: string | { encoding: string; flag?: string },
      callback: (err: NodeJS.ErrnoException, data: string) => void
    ): void;
    readFile(
      filename: string,
      options: {
        flag?: string;
      },
      callback: (err: NodeJS.ErrnoException, data: Buffer) => void
    ): void;
    readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
    readFileSync(filename: string): Buffer;
    readJson?(path: string, callback: (err: NodeJS.ErrnoException, data: any) => void): void;
    readJsonSync?(path: string): any;
    readlink(path: string, callback: (err: NodeJS.ErrnoException, linkString: string) => void): void;
    readlinkSync(path: string): string;
    stat(path: string, callback: (err: NodeJS.ErrnoException, stats: Stats) => void): void;
    statSync(path: string): Stats;
  }

  export class NodeJsInputFileSystem implements AbstractInputFileSystem {
    public readdir(path: string, callback: (err: NodeJS.ErrnoException, files: string[]) => void): void;
    public readFile(
      filename: string,
      encoding: string | { encoding: string; flag?: string | undefined },
      callback: (err: NodeJS.ErrnoException, data: string) => void
    ): void;
    public readFile(filename: string, options: { flag?: string | undefined }, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
    public readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
    public readFile(filename: any, options: any, callback?: any): void;
    public readlink(path: string, callback: (err: NodeJS.ErrnoException, linkString: string) => void): void;
    public stat(path: string, callback: (err: NodeJS.ErrnoException, stats: Stats) => void): void;
    public statSync(path: string): Stats;
    public readlinkSync(path: string): string;
    public readFileSync(filename: string): Buffer;
    public readdirSync(path: string): string[];
  }

  export class CachedInputFileSystem {
    public fileSystem: AbstractInputFileSystem;

    constructor(fileSystem: AbstractInputFileSystem, duration: number);

    public stat(path: string, callback: Callback<Stats>): void;

    public readdir(path: string, callback: Callback<string[]>): void;

    public readFile(path: string, callback: Callback<Buffer>): void;

    public readJson(path: string, callback: Callback<any>): void;

    public readlink(path: string, callback: Callback<string>): void;

    public statSync(path: string | Buffer): Stats;

    public readdirSync(path: string): string[];

    public readFileSync(filename: string, options?: string): string | Buffer;

    public readlinkSync(path: string | Buffer): string;

    public readJsonSync(path: string): any;

    public purge(what?: string | string[]): void;
  }
}
