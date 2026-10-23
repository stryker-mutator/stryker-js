export interface DecoratorsOptions {
  /**
   * The decorators proposal version to parse with, forwarded to
   * `@babel/plugin-proposal-decorators`.
   * @see https://babeljs.io/docs/babel-plugin-proposal-decorators#version
   */
  version: 'legacy' | '2023-11';
}

export interface ParserOptions {
  plugins: unknown[] | null;
  /**
   * Configures the decorators plugin used while parsing TypeScript (`.ts`/`.tsx`) files.
   * Defaults to `{ version: 'legacy' }` for backward compatibility. Set this to
   * `{ version: '2023-11' }` to parse the TC39 stage-3 decorators proposal, which is
   * also required to parse auto-accessor fields (e.g. `@observable accessor foo`).
   */
  decorators?: DecoratorsOptions | null;
}
