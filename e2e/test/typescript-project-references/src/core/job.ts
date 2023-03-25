import { toUpperCase } from '../utils/text.js';

export function start(): string {
  const logText = "Starting job";
  console.log(toUpperCase(logText));
  return logText;
}
