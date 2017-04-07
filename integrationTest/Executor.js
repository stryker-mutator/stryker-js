"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var Executor = (function () {
    function Executor(cwd, silent) {
        if (silent === void 0) { silent = true; }
        this.silent = silent;
        this.cwd = __dirname + "/" + cwd;
    }
    Executor.prototype.exec = function (command, options, done) {
        console.log("exec: " + this.cwd + "/" + command);
        var args = command.split(' ');
        if (!options) {
            options = {};
        }
        command = args.shift() || '';
        options.cwd = this.cwd;
        options.env = options.env || process.env;
        if (process.platform.substr(0, 3) === 'win') {
            command = command + '.cmd';
        }
        var child = child_process_1.spawn(command, args, options);
        this.handleProcess(child, done);
    };
    Executor.prototype.handleProcess = function (child, done) {
        var _this = this;
        var stderr = new Buffer('');
        var stdout = new Buffer('');
        if (child.stdout) {
            child.stdout.on('data', function (buf) {
                if (!_this.silent) {
                    console.log(String(buf));
                }
                stdout = Buffer.concat([stdout, new Buffer(buf)]);
            });
        }
        if (child.stderr) {
            child.stderr.on('data', function (buf) {
                if (!_this.silent) {
                    console.error(String(buf));
                }
                stderr = Buffer.concat([stderr, new Buffer(buf)]);
            });
        }
        child.on('close', function (code) {
            if (code !== 0) {
                var error = stdout.toString() + stderr.toString();
                done(error, stdout.toString());
            }
            else {
                done(null, stdout.toString());
            }
        });
    };
    return Executor;
}());
exports.default = Executor;
//# sourceMappingURL=Executor.js.map