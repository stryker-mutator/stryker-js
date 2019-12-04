export class JsonLoader {
  public static loadFile(filePath: string) {
    return require(filePath);
  }
}
