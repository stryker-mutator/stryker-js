import { spawn, ChildProcess } from 'child_process';
import fs from 'fs/promises';
import {
  DiscoverParams,
  DiscoverResult,
  ConfigureParams,
  ConfigureResult,
  MutationTestParams,
  MutationTestResult,
} from 'mutation-server-protocol';
import net from 'net';
import {
  JSONRPCClient,
  JSONRPCServer,
  JSONRPCServerAndClient,
} from 'json-rpc-2.0';
import { StrykerServer } from '../../src/stryker-server.js';
import { resolveFromRoot } from '../helpers/test-utils.js';
import { JsonRpcEventDeserializer } from '../../src/utils/json-rpc-event-deserializer.js';
import { ReplaySubject } from 'rxjs';
import { expect } from 'chai';
import { promisify } from 'util';

describe(StrykerServer.name, () => {
  let sut: ChildProcess;
  let client: MutationServerClient;

  afterEach(() => {
    sut.kill();
  });
  describe('using socket channel', () => {
    let socket: net.Socket;

    beforeEach(async () => {
      sut = spawn(
        'node',
        ['../../../bin/stryker', 'serve', 'socket', '--', '--concurrency', '1'],
        {
          cwd: resolveFromRoot('testResources/stryker-server/happy-project'),
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );
      const port = await new Promise<number>((res, rej) => {
        sut.stderr!.on('data', (data: Buffer) => {
          const output = data.toString('utf8');
          const match = output.match(
            /Stryker server listening on localhost:(\d+)/,
          );
          if (match) {
            res(parseInt(match[1], 10));
          }
        });
      });
      socket = new net.Socket();
      client = new MutationServerClient(socket, socket);
      await new Promise<void>((res, rej) => {
        socket.once('error', rej);
        socket.connect(port, () => {
          // connected
          res();
        });
      });
    });

    afterEach(async () => {
      await promisify(socket.destroy.bind(socket))(undefined);
    });

    actFunctionalTestSuite();
  });

  describe('using stdio channel', () => {
    beforeEach(() => {
      sut = spawn(
        'node',
        [
          resolveFromRoot('bin/stryker'),
          'serve',
          'stdio',
          '--',
          '--concurrency',
          '1',
        ],
        {
          cwd: resolveFromRoot('testResources/stryker-server/happy-project'),
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );
      client = new MutationServerClient(sut.stdout!, sut.stdin!);
    });

    actFunctionalTestSuite();
  });

  function actFunctionalTestSuite() {
    it('should successfully configure the server', async () => {
      const configureParam: ConfigureParams = {
        configFilePath: 'stryker.conf.js',
      };
      const expectedResult: ConfigureResult = {
        version: '0.4.0',
      };

      const result = await client.configure(configureParam);

      expect(result).to.deep.equal(expectedResult);
    });

    it('should be able to discover mutants', async () => {
      expect(await client.discover()).matchSnapshot();
    });

    it('should be able to discover mutants based on a list of files', async () => {
      expect(
        await client.discover({ files: [{ path: 'src/add.js' }] }),
      ).matchSnapshot();
    });

    it('should be able to run mutation tests', async () => {
      const results: MutationTestResult[] = [];
      client.mutationTestResult$.subscribe((result) => results.push(result));
      const finalResult = await client.mutationTest();
      assertEmptyMutationTestResult(finalResult);
      const cleanedResults = cleanResults(results);
      expect(results).lengthOf(6);
      expect(cleanedResults).matchSnapshot();
    });

    it('should be able to run mutation tests twice in parallel', async () => {
      const results: MutationTestResult[] = [];
      client.mutationTestResult$.subscribe((result) => results.push(result));
      const [first, second] = await Promise.all([
        client.mutationTest({ files: [{ path: 'src/app.js' }] }),
        client.mutationTest({ files: [{ path: 'src/math.js' }] }),
      ]);
      assertEmptyMutationTestResult(first);
      assertEmptyMutationTestResult(second);
      const cleanedResults = cleanResults(
        results.sort((a, b) =>
          Object.keys(a.files)[0].localeCompare(Object.keys(b.files)[0]),
        ),
      );
      expect(cleanedResults).lengthOf(5);
      expect(cleanedResults).matchSnapshot();
    });

    it('should delete the `.stryker-tmp` directory after a run', async () => {
      await client.mutationTest();
      const files = await fs.readdir(
        resolveFromRoot('testResources/stryker-server/happy-project'),
      );
      expect(files).not.include('.stryker-tmp');
    });

    it('should be able to run mutation tests with range', async () => {
      const results: MutationTestResult[] = [];
      client.mutationTestResult$.subscribe((result) => results.push(result));
      const finalResult = await client.mutationTest({
        files: [
          {
            path: 'src/app.js',
            range: {
              start: {
                line: 7,
                column: 24,
              },
              end: { line: 7, column: 40 },
            },
          },
        ],
      });
      assertEmptyMutationTestResult(finalResult);
      const cleanedResults = cleanResults(results);
      expect(results).lengthOf(1);
      expect(cleanedResults).matchSnapshot();
    });
  }
});

class MutationServerClient {
  readonly #rpc: JSONRPCServerAndClient;
  readonly #mutationTestResultsSubject =
    new ReplaySubject<MutationTestResult>();
  readonly mutationTestResult$ =
    this.#mutationTestResultsSubject.asObservable();
  readonly #inStream: NodeJS.ReadableStream;
  readonly #outStream: NodeJS.WritableStream;

  constructor(
    inStream: NodeJS.ReadableStream,
    outStream: NodeJS.WritableStream,
  ) {
    this.#inStream = inStream;
    this.#outStream = outStream;
    const deserializer = new JsonRpcEventDeserializer();
    const server = new JSONRPCServer();
    const client = new JSONRPCClient((jsonRPCRequest) => {
      const content = Buffer.from(JSON.stringify(jsonRPCRequest));
      this.#outStream.write(`Content-Length: ${content.byteLength}\r\n\r\n`);
      this.#outStream.write(content);
    });
    this.#rpc = new JSONRPCServerAndClient(server, client);
    this.#rpc.addMethod(
      'reportMutationTestProgress',
      (result: MutationTestResult) => {
        this.#mutationTestResultsSubject.next(result);
      },
    );

    this.#inStream.on('data', (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      for (const event of deserializer.deserialize(data)) {
        this.#rpc.receiveAndSend(event).catch((error) => {
          console.error(error);
        });
      }
    });
  }

  async configure(params: ConfigureParams = {}): Promise<ConfigureResult> {
    return this.#rpc.request('configure', params);
  }

  async discover(params: DiscoverParams = {}): Promise<DiscoverResult> {
    return this.#rpc.request('discover', params);
  }

  async mutationTest(
    params: MutationTestParams = {},
  ): Promise<MutationTestResult> {
    return this.#rpc.request('mutationTest', params);
  }
}

/**
 * Removes the statusReason from the results for snapshot testing purposes, as it may contain arbitrary stdout messages like "Debugger attached".
 */
function cleanResults(results: MutationTestResult[]): MutationTestResult[] {
  return results.map((result) => ({
    files: Object.fromEntries(
      Object.entries(result.files).map(([key, value]) => [
        key,
        {
          mutants: value.mutants.map((mutant) => {
            const { statusReason, ...fields } = mutant;
            return fields;
          }),
        },
      ]),
    ),
  }));
}

function assertEmptyMutationTestResult(actualResult: MutationTestResult) {
  expect(actualResult).deep.eq({ files: {} } satisfies MutationTestResult);
}
