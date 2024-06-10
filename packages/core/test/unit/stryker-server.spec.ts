import { factory } from '@stryker-mutator/test-helpers';
import * as typedInject from 'typed-inject';

import sinon from 'sinon';
import { Command } from 'commander';
import { expect } from 'chai';

import * as serverTokens from '../../src/server/server-tokens.js';
import { StrykerServer } from '../../src/index.js';
import { WebSocketTransporter } from '../../src/server/transport/index.js';
import { MutationServerProtocolHandler } from '../../src/server/index.js';

describe(StrykerServer.name, () => {
  let injectorStub: sinon.SinonStubbedInstance<typedInject.Injector>;
  let transporterStub: sinon.SinonStubbedInstance<WebSocketTransporter>;
  let mutationServerProtocolHandler: sinon.SinonStubbedInstance<MutationServerProtocolHandler>;

  beforeEach(() => {
    injectorStub = factory.injector();
    transporterStub = sinon.createStubInstance(WebSocketTransporter);
    mutationServerProtocolHandler = sinon.createStubInstance(MutationServerProtocolHandler);

    injectorStub.injectClass
      .withArgs(WebSocketTransporter)
      .returns(transporterStub)
      .withArgs(MutationServerProtocolHandler)
      .returns(mutationServerProtocolHandler);
  });

  it('should create transporter with provided port', () => {
    const args = ['node', 'stryker-server', '--port', '4200'];

    // Act
    new StrykerServer(args, new Command(), () => injectorStub);

    expect(injectorStub.provideValue).calledWith(serverTokens.port, '4200');
    expect(injectorStub.provideClass).calledWith(serverTokens.transporter, WebSocketTransporter);
    expect(injectorStub.injectClass).calledWith(MutationServerProtocolHandler);
  });
});
