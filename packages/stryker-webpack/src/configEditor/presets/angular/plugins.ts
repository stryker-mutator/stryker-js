import * as path from "path";
import { ContextReplacementPlugin, Plugin } from 'webpack';

export const contextReplacementPlugin = (root: string): Plugin => new ContextReplacementPlugin(
  // The (\\|\/) piece accounts for path separators in *nix and Windows
  /angular(\\|\/)core(\\|\/)@angular/,
  path.join(root, 'src'), // location of your src
  {} // a map of your routes
)