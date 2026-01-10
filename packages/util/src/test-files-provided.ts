export function testFilesProvided(options: {
  testFiles?: readonly string[];
}): boolean {
  return !!options.testFiles && options.testFiles.length > 0;
}
