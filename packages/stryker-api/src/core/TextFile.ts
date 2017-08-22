import FileDescriptor from './FileDescriptor';

export default interface TextFile extends FileDescriptor {
  content: string;
}