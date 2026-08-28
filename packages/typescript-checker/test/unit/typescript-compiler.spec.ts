import { expect } from 'chai';
import sinon from 'sinon';
import ts from 'typescript';
import type { Logger } from '@stryker-mutator/api/logging';
import type { StrykerOptions } from '@stryker-mutator/api/core';

import { TypescriptCompiler } from '../../src/typescript-compiler.js';
import { HybridFileSystem } from '../../src/fs/hybrid-file-system.js';
import { ScriptFile } from '../../src/fs/script-file.js';

type BuilderProgram = Pick<
  ts.EmitAndSemanticDiagnosticsBuilderProgram,
  'getSourceFiles' | 'getAllDependencies'
>;

interface CapturedBuilderHost {
  readonly system: ts.System;
}

function createStatusDiagnostic(code: number): ts.Diagnostic {
  return {
    category: ts.DiagnosticCategory.Message,
    code,
    file: undefined,
    start: undefined,
    length: undefined,
    messageText: 'status',
  };
}

function arrangeBuilderHost(options?: { runCreateProgram?: boolean }) {
  const createHostStub = sinon
    .stub(ts, 'createSolutionBuilderWithWatchHost')
    .returns({} as ts.SolutionBuilderWithWatchHost<ts.BuilderProgram>);

  sinon.stub(ts, 'createSolutionBuilderWithWatch').callsFake(() => {
    return {
      build: () => {
        const hostArgs = createHostStub.firstCall.args;
        const createProgram = hostArgs[1] as
          | ((...args: unknown[]) => unknown)
          | undefined;
        const reportSummary = hostArgs[4] as
          | ((diagnostic: ts.Diagnostic) => void)
          | undefined;

        if (options?.runCreateProgram) {
          createProgram?.();
        }
        reportSummary?.(createStatusDiagnostic(0));
      },
    } as ts.SolutionBuilder<ts.BuilderProgram>;
  });

  const host: CapturedBuilderHost = {
    get system() {
      return createHostStub.firstCall.args[0] as ts.System;
    },
  };
  return host;
}

describe(TypescriptCompiler.name, () => {
  let sut: TypescriptCompiler;
  let fsMock: sinon.SinonStubbedInstance<HybridFileSystem>;
  let logMock: {
    warn: sinon.SinonStub;
    debug: sinon.SinonStub;
  };

  beforeEach(() => {
    sinon.stub(ts.sys, 'fileExists').returns(true);
    sinon.stub(ts.sys, 'readFile').returns('{}');

    fsMock = {
      getFile: sinon.stub(),
      writeFile: sinon.stub(),
      watchFile: sinon.stub(),
      existsInMemory: sinon.stub(),
    } as unknown as sinon.SinonStubbedInstance<HybridFileSystem>;
    logMock = {
      warn: sinon.stub(),
      debug: sinon.stub(),
    };

    sut = new TypescriptCompiler(
      logMock as unknown as Logger,
      { tsconfigFile: 'tsconfig.json' } as StrykerOptions,
      fsMock,
    );
  });

  describe(TypescriptCompiler.prototype.init.name, () => {
    it('should throw when the tsconfig file does not exist', async () => {
      (ts.sys.fileExists as sinon.SinonStub).returns(false);

      await expect(sut.init()).rejectedWith(
        'The tsconfig file does not exist at:',
      );
    });

    it('should ignore tsbuildinfo files in host system methods', async () => {
      const host = arrangeBuilderHost();

      await sut.init();

      expect(host.system.readFile('foo.tsbuildinfo')).undefined;
      expect(host.system.fileExists('foo.tsbuildinfo')).false;
      expect(host.system.getModifiedTime?.('foo.tsbuildinfo')).undefined;
    });

    it('should leave invalid tsconfig content unchanged', async () => {
      const host = arrangeBuilderHost();
      const localSut = new TypescriptCompiler(
        logMock as unknown as Logger,
        { tsconfigFile: '/project/tsconfig.json' } as StrykerOptions,
        fsMock,
      );
      const content = '{ this is invalid json';

      (ts.sys.readFile as sinon.SinonStub)
        .withArgs('/project/tsconfig.json')
        .returns('{}');
      fsMock.getFile
        .withArgs('/project/tsconfig.json')
        .returns(new ScriptFile(content, '/project/tsconfig.json'));

      await localSut.init();

      expect(host.system.readFile('/project/tsconfig.json')).eq(content);
    });

    it('should override root and referenced tsconfig compiler options', async () => {
      const host = arrangeBuilderHost();
      const localSut = new TypescriptCompiler(
        logMock as unknown as Logger,
        { tsconfigFile: '/project/tsconfig.json' } as StrykerOptions,
        fsMock,
      );

      const rootConfig = JSON.stringify({
        references: [{ path: '/tmp/ref-tsconfig.json' }],
        compilerOptions: { noEmit: false },
      });
      const referencedConfig = JSON.stringify({
        compilerOptions: { noEmit: false },
      });

      (ts.sys.readFile as sinon.SinonStub)
        .withArgs('/project/tsconfig.json')
        .returns('{}');
      fsMock.getFile
        .withArgs('/project/tsconfig.json')
        .returns(new ScriptFile(rootConfig, '/project/tsconfig.json'));
      fsMock.getFile
        .withArgs('/tmp/ref-tsconfig.json')
        .returns(new ScriptFile(referencedConfig, '/tmp/ref-tsconfig.json'));

      await localSut.init();

      const adjustedRoot = host.system.readFile('/project/tsconfig.json');
      const adjustedReference = host.system.readFile('/tmp/ref-tsconfig.json');

      expect(JSON.parse(adjustedRoot as string).compilerOptions.noEmit).true;
      expect(JSON.parse(adjustedReference as string).compilerOptions.noEmit)
        .true;
    });
  });

  describe('nodes', () => {
    let sourceFiles: ts.SourceFile[];
    let dependenciesByFileName: Map<string, string[]>;

    beforeEach(() => {
      sourceFiles = [];
      dependenciesByFileName = new Map();
      sinon
        .stub(ts, 'createEmitAndSemanticDiagnosticsBuilderProgram')
        .callsFake(() => {
          const program: BuilderProgram = {
            getSourceFiles: () => sourceFiles,
            getAllDependencies: (file) =>
              dependenciesByFileName.get(file.fileName) ?? [],
          };
          return program as ts.EmitAndSemanticDiagnosticsBuilderProgram;
        });
    });

    it('should create parent-child graph and ignore unknown imports', async () => {
      arrangeBuilderHost({ runCreateProgram: true });
      const aFile = ts.createSourceFile(
        'a.ts',
        '',
        ts.ScriptTarget.Latest,
        false,
      );
      const bFile = ts.createSourceFile(
        'b.ts',
        '',
        ts.ScriptTarget.Latest,
        false,
      );
      sourceFiles.push(aFile, bFile);
      dependenciesByFileName.set('a.ts', ['b.ts', 'missing.ts']);

      await sut.init();

      const nodes = sut.nodes;

      expect(
        nodes.get('a.ts')?.children.map((child) => child.fileName),
      ).deep.eq(['b.ts']);
      expect(
        nodes.get('b.ts')?.parents.map((parent) => parent.fileName),
      ).deep.eq(['a.ts']);
    });

    it('should throw during init when declaration dependency cannot be read', async () => {
      arrangeBuilderHost({ runCreateProgram: true });
      const aFile = ts.createSourceFile(
        '/project/a.ts',
        '',
        ts.ScriptTarget.Latest,
        false,
      );
      sourceFiles.push(aFile);
      dependenciesByFileName.set('/project/a.ts', ['/a/index.d.ts']);
      fsMock.getFile.withArgs('/a/index.d.ts').returns(undefined);

      await expect(sut.init()).rejectedWith('Could not find /a/index.d.ts');
    });

    it('should warn when declaration sourcemap is missing', async () => {
      arrangeBuilderHost({ runCreateProgram: true });
      const aFile = ts.createSourceFile(
        '/project/a.ts',
        '',
        ts.ScriptTarget.Latest,
        false,
      );
      sourceFiles.push(aFile);
      dependenciesByFileName.set('/project/a.ts', ['/a/index.d.ts']);
      fsMock.getFile
        .withArgs('/a/index.d.ts')
        .returns(
          new ScriptFile(
            '//# sourceMappingURL=index.d.ts.map',
            '/a/index.d.ts',
          ),
        );
      fsMock.getFile.withArgs('/a/index.d.ts.map').returns(undefined);

      await sut.init();

      expect(logMock.warn).calledWith(
        'Could not find sourcemap /a/index.d.ts.map',
      );
    });

    it('should resolve declaration dependencies to source files using sourcemaps', async () => {
      arrangeBuilderHost({ runCreateProgram: true });
      const aFile = ts.createSourceFile(
        '/project/a.ts',
        '',
        ts.ScriptTarget.Latest,
        false,
      );
      const sourceFile = ts.createSourceFile(
        '/src/index.ts',
        '',
        ts.ScriptTarget.Latest,
        false,
      );
      sourceFiles.push(aFile, sourceFile);
      dependenciesByFileName.set('/project/a.ts', ['/a/index.d.ts']);
      fsMock.getFile
        .withArgs('/a/index.d.ts')
        .returns(
          new ScriptFile(
            '//# sourceMappingURL=index.d.ts.map',
            '/a/index.d.ts',
          ),
        );
      fsMock.getFile
        .withArgs('/a/index.d.ts.map')
        .returns(
          new ScriptFile(
            JSON.stringify({ sources: ['../src/index.ts'] }),
            '/a/index.d.ts.map',
          ),
        );

      await sut.init();

      const nodes = sut.nodes;

      expect(
        nodes.get('/project/a.ts')?.children.map((child) => child.fileName),
      ).deep.eq(['/src/index.ts']);
    });
  });
});
