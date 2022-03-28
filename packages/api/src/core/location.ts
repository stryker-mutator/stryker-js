import { Position } from './position.js';

/**
 * A location in the source code which can span multiple lines and/or columns.
 */
export interface Location {
  start: Position;
  end: Position;
}
