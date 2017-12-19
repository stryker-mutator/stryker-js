import * as path from "path";
import {Stats} from "fs";

export default class FsWrapper {
    static readonly NO_SUCH_DIRECTORY_ENTRY = "ENOENT";
    static readonly FILE_ALREADY_EXISTS = "EEXIST";
    
    private _fs: FileSystem;

    public constructor(fs: FileSystem) {
        this._fs = fs;
    }

    public readFile(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._fs.readFile(path, "utf8", (err: Error, result: string) => err ? reject(err) : resolve(result));
        })
    }

    public writeFile(path: string, content: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this._fs.writeFile(path, content, (err: Error) => err ? reject(err) : resolve());
        });
    }

    public async mkdirp(directoryPath: string): Promise<void> {
        try {
            await this.mkdir(directoryPath);
        } catch (error) {
            if(error.code === FsWrapper.NO_SUCH_DIRECTORY_ENTRY) {
                // Recursively move down the tree until we find a dir that exists
                await this.mkdirp(path.dirname(directoryPath));

                // Bubble back up and create every directory
                await this.mkdirp(directoryPath);
            } else if(error.code === FsWrapper.FILE_ALREADY_EXISTS) {
                const stats = await this.stat(directoryPath);

                // Throw an error when the required directory turns out to be a file
                if (!stats.isDirectory()) {
                    throw error;
                }
            } else {
                // Throw all other errors
                throw error;
            }
        }
    }

    private mkdir(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this._fs.mkdir(path, {}, (err: Error) => err ? reject(err) : resolve());
        });
    }

    private stat(path: string): Promise<Stats> {
        return new Promise((resolve, reject) => {
            this._fs.stat(path, (err: Error, result: any) => err ? reject(err) : resolve(result));
        });
    }
}

export interface FileSystem {
    mkdir(path: string, optArgs: {}, callback: (err: Error, result: any) => void): void

    stat(path: string, callback: (err: Error, result: Stats) => void): void

    writeFile(path: string, content: string, callback: (err: Error) => void): void

    readFile(path: string, options: string, callback: (err: Error, content: string) => void): void
}