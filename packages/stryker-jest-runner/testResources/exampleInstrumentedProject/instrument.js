const fs = require('fs');
const path = require('path');
const InstrumentTranspiler = require('../../../stryker/src/transpiler/CoverageInstrumenterTranspiler').default;
const File = require('../../../stryker-api/src/core/File').default;


async function transpile() {
  const files = [
    require.resolve('../exampleProject/src/Add'),
    require.resolve('../exampleProject/src/Circle')
  ].map(fileName => new File(fileName, fs.readFileSync(fileName)));

  const instr = new InstrumentTranspiler({ coverageAnalysis: 'all' }, files.map(file => file.name))
  const transpiledFiles = await instr.transpile(files);
  const newFileNames = await Promise.all(transpiledFiles.map(async file => {
    const transpiledFileName = path.resolve(__dirname, 'src', path.basename(file.name));
    await fs.promises.writeFile(transpiledFileName, file.content);
    return transpiledFileName;
  }));
  console.log(`Done, written ${JSON.stringify(newFileNames, null, 2)}`);
}

transpile()
  .catch(console.error.bind(console))

