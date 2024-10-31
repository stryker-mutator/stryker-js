import { DiscoverParams, DiscoverResult, ConfigureParams, ConfigureResult, MutationTestParams, MutationTestResult } from 'mutation-server-protocol';
import net from 'net';
import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0';
import { StrykerServer } from '../../src/stryker-server.js';
import { resolveFromRoot } from '../helpers/test-utils.js';
import { JsonRpcEventDeserializer } from '../../src/utils/json-rpc-event-deserializer.js';
import { ReplaySubject } from 'rxjs';
import { expect } from 'chai';

describe.only(StrykerServer.name, () => {
  describe('on a happy flow project', () => {
    let sut: StrykerServer;
    let client: MutationServerClient;

    beforeEach(async () => {
      process.chdir(resolveFromRoot('testResources/stryker-server/happy-project'));
      sut = new StrykerServer({ plugins: [], concurrency: 1 });
      const port = await sut.start();
      client = await MutationServerClient.create(port);
    });

    it('should be able to discover mutants', async () => {
      expect(await client.discover()).matchSnapshot();
    });

    it('should be able to run mutation tests', async () => {
      const results: MutationTestResult[] = [];
      client.mutationTestResult$.subscribe((result) => results.push(result));
      const finalResult = await client.mutationTest();
      expect(finalResult).deep.eq({ files: {} } satisfies MutationTestResult);
      const cleanedResults = cleanResults(results);
      expect(results).lengthOf(6);
      expect(cleanedResults).matchSnapshot();
    });

    afterEach(async () => {
      await client.end();
      await sut.stop();
    });
  });
});

class MutationServerClient {
  readonly #rpc: JSONRPCServerAndClient;
  readonly #mutationTestResultsSubject = new ReplaySubject<MutationTestResult>();
  readonly mutationTestResult$ = this.#mutationTestResultsSubject.asObservable();
  readonly #socket: net.Socket;
  readonly #port;

  private constructor(port: number) {
    this.#port = port;
    this.#socket = new net.Socket();
    const deserializer = new JsonRpcEventDeserializer();
    const server = new JSONRPCServer();
    const client = new JSONRPCClient((jsonRPCRequest) => {
      const content = Buffer.from(JSON.stringify(jsonRPCRequest));
      this.#socket.write(`Content-Length: ${content.byteLength}\r\n\r\n`);
      this.#socket.write(content);
    });
    this.#rpc = new JSONRPCServerAndClient(server, client);
    this.#rpc.addMethod('reportMutationTestProgress', (result: MutationTestResult) => {
      this.#mutationTestResultsSubject.next(result);
    });

    this.#socket.on('data', (data) => {
      for (const event of deserializer.deserialize(data)) {
        this.#rpc.receiveAndSend(event);
      }
    });
  }

  private start() {
    return new Promise<void>((res, rej) => {
      this.#socket.connect(this.#port, () => {
        res();
      });
      this.#socket.once('error', rej);
    });
  }

  public end() {
    return new Promise<void>((res) => {
      this.#socket.end(() => {
        res();
      });
    });
  }

  static async create(port: number) {
    const client = new MutationServerClient(port);
    await client.start();
    return client;
  }

  async configure(params: ConfigureParams = {}): Promise<ConfigureResult> {
    return this.#rpc.request('configure', params);
  }

  async discover(params: DiscoverParams = {}): Promise<DiscoverResult> {
    return this.#rpc.request('discover', params);
  }

  async mutationTest(params: MutationTestParams = {}): Promise<MutationTestResult> {
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
