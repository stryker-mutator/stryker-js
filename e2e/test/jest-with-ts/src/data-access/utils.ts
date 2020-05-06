import { StorageError } from 'azure-storage';

export function encodeKey(inputWithSlashes: string) {
  return inputWithSlashes.replace(/\//g, ';');
}

export function decodeKey(inputWithSemiColons: string) {
  return inputWithSemiColons.replace(/;/g, '/');
}

export function isStorageError(maybeStorageError: unknown): maybeStorageError is StorageError {
  return maybeStorageError instanceof Error && (maybeStorageError as StorageError).name === 'StorageError';
}
