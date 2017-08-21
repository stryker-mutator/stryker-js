import { Location } from '../../core';

export default interface FileLocation extends Location {
  fileName: string;
}