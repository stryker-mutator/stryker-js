import {spawn, ChildProcess} from 'child_process';

export default class Executor {

  private cwd: string;

  constructor(cwd: string, private silent: boolean = true) {
    this.cwd = `${__dirname}/${cwd}`;
  }

  exec(command: string, options: any, done: (error: any, stdout: string) => any) {
    console.log(`exec: ${this.cwd}/${command}`);

    let args = command.split(' ');
    if (!options) {
      options = {};
    }
    command = args.shift();
    options.cwd = this.cwd;
    options.env = options.env || process.env;
    if (process.platform.substr(0, 3) === 'win') {
      command = command + '.cmd';
    }
    let child = spawn(command, args, options);
    this.handleProcess(child, done);
  }

  private handleProcess(child: ChildProcess, done: (error: any, output: string) => any) {
    let stderr = new Buffer('');
    let stdout = new Buffer('');
    if (child.stdout) {
      child.stdout.on('data', (buf: Buffer) => {
        if (!this.silent) {
          console.log(String(buf));
        }
        stdout = Buffer.concat([stdout, new Buffer(buf)]);
      });
    }
    if (child.stderr) {
      child.stderr.on('data', (buf: Buffer) => {
        if (!this.silent) {
          console.error(String(buf));
        }
        stderr = Buffer.concat([stderr, new Buffer(buf)]);
      });
    }
    child.on('close', function(code: number) {
      if (code !== 0) {
        let error = stdout.toString() + stderr.toString();
        done(error, stdout.toString());
      } else {
        done(null, stdout.toString());
      }
    });
  }
}