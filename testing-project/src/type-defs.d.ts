interface Drink {
  name: string;
  price: number;
  isAlcoholic: boolean;
}

interface OrderItem extends Drink {
  amount: number;
}

type RouteCallback = (route: string) => void;
