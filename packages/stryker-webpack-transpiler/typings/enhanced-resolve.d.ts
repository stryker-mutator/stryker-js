/// <reference types="node" />
declare module 'enhanced-resolve' {
    interface Stats {
        isFile(): boolean;
        isDirectory(): boolean;
        isBlockDevice(): boolean;
        isCharacterDevice(): boolean;
        isSymbolicLink(): boolean;
        isFIFO(): boolean;
        isSocket(): boolean;
    }
    type Callback<T> = (err: NodeJS.ErrnoException | null | undefined, arg?: T) => void;
    interface AbstractInputFileSystem {
        purge?(what?: string | string[]): void;
        readdir(path: string, callback: (err: NodeJS.ErrnoException, files: string[]) => void): void;
        readdirSync(path: string): string[];
        readFile(filename: string, encoding: string | {
            encoding: string;
            flag?: string;
        }, callback: (err: NodeJS.ErrnoException, data: string) => void): void;
        readFile(filename: string, options: {
            flag?: string;
        }, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
        readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
        readFileSync(filename: string): Buffer;
        readJson?(path: string, callback: (err: NodeJS.ErrnoException, data: any) => void): void;
        readJsonSync?(path: string): any;
        readlink(path: string, callback: (err: NodeJS.ErrnoException, linkString: string) => void): void;
        readlinkSync(path: string): string;
        stat(path: string, callback: (err: NodeJS.ErrnoException, stats: Stats) => void): void;
        statSync(path: string): Stats;
    }
    class NodeJsInputFileSystem implements AbstractInputFileSystem {
        readdir(path: string, callback: (err: NodeJS.ErrnoException, files: string[]) => void): void;
        readFile(filename: string, encoding: string | {
            encoding: string;
            flag?: string | undefined;
        }, callback: (err: NodeJS.ErrnoException, data: string) => void): void;
        readFile(filename: string, options: {
            flag?: string | undefined;
        }, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
        readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
        readFile(filename: any, options: any, callback?: any): void;
        readlink(path: string, callback: (err: NodeJS.ErrnoException, linkString: string) => void): void;
        stat(path: string, callback: (err: NodeJS.ErrnoException, stats: Stats) => void): void;
        statSync(path: string): Stats;
        readlinkSync(path: string): string;
        readFileSync(filename: string): Buffer;
        readdirSync(path: string): string[];
    }
    class CachedInputFileSystem {
        fileSystem: AbstractInputFileSystem;
        constructor(fileSystem: AbstractInputFileSystem, duration: number);
        stat(path: string, callback: Callback<Stats>): void;
        readdir(path: string, callback: Callback<string[]>): void;
        readFile(path: string, callback: Callback<Buffer>): void;
        readJson(path: string, callback: Callback<any>): void;
        readlink(path: string, callback: Callback<string>): void;
        statSync(path: string | Buffer): Stats;
        readdirSync(path: string): string[];
        readFileSync(filename: string, options?: string): Buffer;
        readlinkSync(path: string | Buffer): string;
        readJsonSync(path: string): any;
        purge(what?: string | string[]): void;
    }
}
//# sourceMappingURL=enhanced-resolve.d.ts.map