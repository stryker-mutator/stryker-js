// A node:test test is identified to Stryker by a synthetic id that encodes both
// the (cwd-relative) file it lives in and its name, separated by a NUL char.
//
// Encoding the file into the id is what makes per-mutant test selection work:
// `dryRun` and `mutantRun` run in *different* processes, so the runner cannot
// keep a test->file map between them. By parsing the file straight out of each
// id in `testFilter`, `mutantRun` can pick the covering files statelessly. It
// also makes ids collision-safe -- two equally-named tests in different files
// get distinct ids, so a mutant can never be filtered down to the wrong file.
const SEPARATOR = String.fromCharCode(0);

export function toTestId(relativeFile: string, name: string): string {
  return `${relativeFile}${SEPARATOR}${name}`;
}

export function fileOfTestId(id: string): string {
  const index = id.indexOf(SEPARATOR);
  return index === -1 ? id : id.slice(0, index);
}
