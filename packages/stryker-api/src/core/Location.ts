import Position from './Position';

/**
 * A location in the source code which can span multiple lines and/or columns.
 */
interface Location {
  end: Position;
  start: Position;
}

export default Location;
