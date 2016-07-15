
export enum MessageType {
  Start,
  Init,
  InitDone,
  Run,
  Result,
  Dispose,
  DisposeDone
}

export interface Message<T> {
  type: MessageType;
  body?: T;
}

export default Message;