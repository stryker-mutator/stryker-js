import {exec} from "child_process";

const execute = (code: string): Promise<{stdout: any, stderr: any}> => {
    return new Promise((resolve, reject) => {
        exec(`node -e '${code}'`, (err, stdout, stderr) => {
            if(err) { 
                reject(err) 
            } else {
                resolve({stdout, stderr});
            }
        });
    });
}

export default execute;