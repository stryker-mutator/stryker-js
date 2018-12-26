
declare module 'enhanced-resolve' {
  export interface Stats {
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isDirectory(): boolean;
    isFIFO(): boolean;
    isFile(): boolean;
    isSocket(): boolean;
    isSymbolicLink(): boolean;
  }

  type Callback<T> = (err: NodeJS.ErrnoException | null | undefined, arg?: T) => void;

  export interface AbstractInputFileSystem {
    purge?(what?: string | string[]): void;
    readdir(path: string, callback: (err: NodeJS.ErrnoException, files: string[]) => void): void;
    readdirSync(path: string): string[];
    readFile(
      filename: string,
      encoding: string | { encoding: string; flag?: string },
      callback: (err: NodeJS.ErrnoException, data: string) => void): void;
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
    public readdirSync(path: string): string[];
    public readFile(filename: string, encoding: string | { encoding: string; flag?: string | undefined }, callback: (err: NodeJS.ErrnoException, data: string) => void): void;
    public readFile(filename: string, options: { flag?: string | undefined }, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
    public readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
    public readFile(filename: any, options: any, callback?: any): void;
    public readFileSync(filename: string): Buffer;
    public readlink(path: string, callback: (err: NodeJS.ErrnoException, linkString: string) => void): void;
    public readlinkSync(path: string): string;
    public stat(path: string, callback: (err: NodeJS.ErrnoException, stats: Stats) => void): void;
    public statSync(path: string): Stats;
  }

  export class CachedInputFileSystem {
    public fileSystem: AbstractInputFileSystem;

    constructor(fileSystem: AbstractInputFileSystem, duration: number);

    public purge(what?: string | string[]): void;

    public readdir(path: string, callback: Callback<string[]>): void;

    public readdirSync(path: string): string[];

    public readFile(path: string, callback: Callback<Buffer>): void;

    public readFileSync(filename: string, options?: string): Buffer;

    public readJson(path: string, callback: Callback<any>): void;

    public readJsonSync(path: string): any;

    public readlink(path: string, callback: Callback<string>): void;

    public readlinkSync(path: string | Buffer): string;

    public stat(path: string, callback: Callback<Stats>): void;

    public statSync(path: string | Buffer): Stats;
  }
}
