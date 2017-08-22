import FileDescriptor from './FileDescriptor';

export default interface BinaryFile extends FileDescriptor {
  content: Buffer;
}