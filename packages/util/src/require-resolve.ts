/**
 * Require a module from the current working directory (or a different base dir)
 * @see https://nodejs.org/api/modules.html#modules_require_resolve_paths_request
 */
export function requireResolve(id: string, from = process.cwd()): unknown {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(require.resolve(id, { paths: [from] }));
}
