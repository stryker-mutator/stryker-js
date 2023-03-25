declare module jasmine {
  interface Matchers<T> {
    toBePlaying(song: import('../../src/Song').Song): boolean;
  }
}
