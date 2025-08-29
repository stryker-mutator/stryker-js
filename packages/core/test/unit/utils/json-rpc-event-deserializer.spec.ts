import { expect } from 'chai';
import { JsonRpcEventDeserializer } from '../../../src/utils/json-rpc-event-deserializer.js';

describe(JsonRpcEventDeserializer.name, () => {
  let sut: JsonRpcEventDeserializer;
  beforeEach(() => {
    sut = new JsonRpcEventDeserializer();
  });

  it('should be able to read a single event', () => {
    const event = { some: 'event' };
    const body = JSON.stringify(event);
    const bodyContent = Buffer.from(body, 'utf8');
    const events = sut.deserialize(
      Buffer.from(`Content-Length:${bodyContent.byteLength}\r\n\r\n${body}`),
    );
    expect(events).deep.eq([event]);
  });

  it('should be able to read multiple events', () => {
    const event1 = { some: 'event1' };
    const event2 = { some: 'event2' };
    const body1 = JSON.stringify(event1);
    const body2 = JSON.stringify(event2);
    const bodyContent1 = Buffer.from(body1, 'utf8');
    const bodyContent2 = Buffer.from(body2, 'utf8');
    const events = sut.deserialize(
      Buffer.from(
        `Content-Length:${bodyContent1.byteLength}\r\n\r\n${body1}Content-Length:${bodyContent2.byteLength}\r\n\r\n${body2}`,
      ),
    );
    expect(events).deep.eq([event1, event2]);
  });

  it('should be able to read an event when the content is chunked', () => {
    const event = { some: 'event' };
    const body = JSON.stringify(event);
    const bodyContent = Buffer.from(body, 'utf8');
    const events1 = sut.deserialize(
      Buffer.from(
        `Content-Length:${bodyContent.byteLength}\r\n\r\n${body.substring(0, 5)}`,
      ),
    );
    const events2 = sut.deserialize(Buffer.from(`${body.substring(5)}`));
    expect(events1).deep.eq([]);
    expect(events2).deep.eq([event]);
  });

  it('should be able to read an event when the header is chunked', () => {
    const event = { some: 'event' };
    const body = JSON.stringify(event);
    const bodyContent = Buffer.from(body, 'utf8');
    const events1 = sut.deserialize(Buffer.from(`Content-Length:`));
    const events2 = sut.deserialize(
      Buffer.from(`${bodyContent.byteLength}\r\n\r\n${body}`),
    );
    expect(events1).deep.eq([]);
    expect(events2).deep.eq([event]);
  });

  it('should support spaces around the content length', () => {
    const event = { some: 'event' };
    const body = JSON.stringify(event);
    const bodyContent = Buffer.from(body, 'utf8');
    const events = sut.deserialize(
      Buffer.from(`Content-Length: ${bodyContent.byteLength} \r\n\r\n${body}`),
    );
    expect(events).deep.eq([event]);
  });
});
