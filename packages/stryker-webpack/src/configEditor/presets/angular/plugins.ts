import * as path from "path";
import { ContextReplacementPlugin } from 'webpack';

export const contextReplacementPlugin = new ContextReplacementPlugin(
  // The (\\|\/) piece accounts for path separators in *nix and Windows
  /angular(\\|\/)core(\\|\/)@angular/,
  path.join('src'), // location of your src
  {} // a map of your routes
)