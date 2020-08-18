module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./setupEnzyme.ts'],
  snapshotSerializers: ["enzyme-to-json/serializer"]
};
