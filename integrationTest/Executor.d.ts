export default class Executor {
    private silent;
    private cwd;
    constructor(cwd: string, silent?: boolean);
    exec(command: string, options: any, done: (error: any, stdout: string) => any): void;
    private handleProcess(child, done);
}
