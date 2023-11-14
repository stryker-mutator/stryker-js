/**
 * @param {number | undefined} amount
 * @returns {string}
 */
export function currency(amount) {
  return `€ ${amount?.toFixed(2)}`;
}
