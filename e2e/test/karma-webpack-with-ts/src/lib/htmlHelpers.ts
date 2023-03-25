export function toAbsoluteUrl(fragment: string): string {
  // Use absolute url because of https://github.com/stryker-mutator/mutation-testing-elements/issues/53
  const url = new URL(window.location.href);
  return new URL(`#${fragment}`, url).href;
}
