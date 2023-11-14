/**
 * @param {OrderItem[] | undefined} drinks
 * @return {string}
 */
export function drinksSummary(drinks) {
  const total = drinks?.reduce((numberOfDrinks, drink) => numberOfDrinks + drink.amount, 0);
  return `${total} drink${total === 1 ? '' : 's'}`;
}
