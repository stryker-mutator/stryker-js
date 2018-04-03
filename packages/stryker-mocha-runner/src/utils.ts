

/**
 * Executes a piece of javascript code in global scope while passing the `require` function
 * @param body The JavaScript to execute
 */
export function evalGlobal(body: string) {
  const fn = new Function('require', body);
  fn(require);
}