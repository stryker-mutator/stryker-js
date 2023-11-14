export class DrinkService {
  /**
   *
   * @returns {Promise<Drink[]>}
   */
  async getDrinks() {
    const response = await fetch('api/drinks.json');
    return response.json();
  }
}

export const drinkService = new DrinkService();
