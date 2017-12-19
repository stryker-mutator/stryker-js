const errors = require("errno");

/* istanbul ignore next */
class HybridFs {
    private fs: any;
    private memoryFs: any;

    constructor(fs: any, memoryFs: any) {
        this.fs = fs;
        this.memoryFs = memoryFs;
    }

    public readFileSync(path: string, optionsOrEncoding: string|Object) {
        try {
            return this.memoryFs.readFileSync(path, optionsOrEncoding);
        } catch(err) {
            if(err.code == errors.code.ENOENT.code) {
                return this.fs.readFileSync(path, optionsOrEncoding);
            }
            else {
                throw err;
            }
        }        
    }

    public readFile(path: string, optArg: any, callback: Function) {
        if(!callback) {
            callback = optArg;
            optArg = undefined;
        }

        this.memoryFs.readFile(path, optArg, (err: Error, file: string) => {
            if(err) {
                this.fs.readFile(path, optArg, callback);
            }
            else {
                callback(err, file);
            }
        });
    }

    public readdirSync(path: string) {
        try {
            return this.memoryFs.readdirSync(path);
        } catch(err) {
            if(err.code === errors.code.ENOTDIR) {
                return this.fs.readdirSync(path);
            }
            else {
                throw err;
            }
        } 
    }

    public readdir(path: string, callback: Function) {
        this.memoryFs.readdir(path, (err: Error, file: string) => {
            if(err) {
                this.fs.readdir(path, callback);
            }
            else {
                callback(err, file);
            }
        });
    }

    public existsSync(path: string) {
        try {
            return this.memoryFs.existsSync(path);
        } catch(err) {
            return this.fs.existsSync(path);
        }
    }

    public exists(path: string, callback: Function) {
        this.memoryFs.exists(path, (err: Error) => {
            if(err) {
                this.fs.exists(path, callback);
            } else {
                callback();
            }
        });
    }

    public statSync(path: string) {
        try {
            return this.memoryFs.statSync(path);
        } catch(err) {
            return this.fs.statSync(path);
        }
    }

    public stat(path: string, callback: Function) {
        this.memoryFs.stat(path, (err: Error, stats: any) => {
            if(err) {
                this.fs.stat(path, callback);
            }
            else {
                callback(err, stats);
            }
        });
    }

    public mkdirpSync = (path: string) => this.memoryFs.mkdirpSync(path);
    public mkdirp = (path: string, callback: Function) => this.memoryFs.mkdirp(path, callback);

    public mkdirSync = (path: string) => this.memoryFs.mkdirSync(path);
    public mkdir = (path: string, optArgs: any, callback: Function) => this.memoryFs.mkdir(path, optArgs, callback);
 
    public rmdirSync = (path: string) => this.memoryFs.rmdirSync(path);
    public rmdir = (path: string, callback: Function) => this.memoryFs.rmdir(path, callback);

    public unlinkSync = (path: string) => this.memoryFs.unlinkSync(path);
    public unlink = (path: string, callback: Function) => this.memoryFs.unlink(path, callback);

    public readlinkSync = (path: string) => this.memoryFs.readlinkSync(path);
    public readlink = (path: string, callback: Function) => this.memoryFs.readlink(path, callback);

    public writeFileSync = (path: string, content: string, optionsOrEncoding?: string|Object) => this.memoryFs.writeFileSync(path, content, optionsOrEncoding);
    public writeFile = (path: string, content: string, optionsOrEncoding: string|Object, callback: Function) => this.memoryFs.writeFile(path, content, optionsOrEncoding, callback);

    public createReadStream = (path: string, options: Object) => this.memoryFs.createReadStream(path, options);

    public createWriteStream = (path: string) => this.memoryFs.createWriteStream(path);

    public join = (path: string, request: any) => this.memoryFs.join(path, request);
    public pathToArray = (path: string) => this.memoryFs.pathToArray(path);
    public normalize = (path: string) => this.memoryFs.normalize(path);
}

export default HybridFs;