// `answer` is computed at module load — before any test runs — so the coverage
// for the `6 * 7` expression is attributed to `static`, and a mutant there is a
// *static* mutant: it only takes effect if it is activated before this module is
// imported.
export const answer = 6 * 7;

export function getAnswer() {
  return answer;
}
