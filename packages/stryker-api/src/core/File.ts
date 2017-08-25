export enum FileKind {
  'Binary',
  'Text',
  'Web',
}

export type File = BinaryFile | TextFile | WebFile;

export interface FileDescriptor {
  name: string;
  included: boolean;
  mutated: boolean;
  kind: FileKind;
}

export interface TextFile extends FileDescriptor {
  content: string;
  kind: FileKind.Text;
}

export interface WebFile extends FileDescriptor {
  kind: FileKind.Web;
 }
 
export interface BinaryFile extends FileDescriptor {
  content: Buffer;
  kind: FileKind.Binary;
}