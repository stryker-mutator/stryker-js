
export enum MessageType{
  Start,
  Run,
  Result
}

interface Message<T> {
  type: MessageType;
  body: T;
}

export default Message;