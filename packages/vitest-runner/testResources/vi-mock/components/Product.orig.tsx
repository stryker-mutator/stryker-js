import { Discount } from './Discount';

export function Product({
  name,
  price,
  discount,
}: {
  name: string;
  price: number;
  discount: number;
}) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{price}</p>
      {discount && <Discount discount={discount} />}
    </div>
  );
}
