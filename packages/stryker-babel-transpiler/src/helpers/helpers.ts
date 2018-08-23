import * as path from 'path';

export function toJSFileName(fileName: string) {
  const fileNameInfo = path.parse(fileName);
  const newFileName = path.join(fileNameInfo.dir, fileNameInfo.name + '.js');
  return newFileName;
}
