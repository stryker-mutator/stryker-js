import { FileKind, File } from 'stryker-api/core';

export function createFile(name: string, content: string, fileKind?: FileKind): File {
    fileKind = fileKind || FileKind.Text;

    const file: any = {
        name: name,
        mutated: true,
        included: true,
        transpiled: true,
        kind: fileKind
    };

    if (fileKind !== FileKind.Web) {
        file.content = content;
    }

    return file as File;
}