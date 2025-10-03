declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBePlaying(song: import('../../src/Song.ts').Song): boolean;
    }
  }
}
