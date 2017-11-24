import {Transpiler} from 'stryker-api/transpile';
import { File } from 'stryker-api/core';
import TranspileResult from 'stryker-api/src/transpile/TranspileResult';
import FileLocation from 'stryker-api/src/transpile/FileLocation';

class BabelTranspiler implements Transpiler {
    public transpile(files: Array<File>): Promise<TranspileResult> {
        throw new Error('Not implemented');
    }

    public getMappedLocation(): FileLocation {
        throw new Error('Not implemented');
    }
}

export default BabelTranspiler;