<script context="module" lang="ts">
  export function sum(a: number, b: number) {
    return a + b;
  }
  // This function is  exported, but will not be tested to see if it affects the no coverage statistic
  export function multiply(a: number, b: number) {
    return a * b;
  }
  export function isOldEnough(age: number) {
    return age >= 18;
  }
  /**
   * This loop will result in an infinite loop when Stryker mutates it.
   */
  export function loop(n: number, action: any) {
    let goOn = true;
    while (goOn) {
      action(n);
      n--;
      goOn = n > 0;
    }
  }
</script>

<script lang="ts">
  interface User { name: string; age: number }
  let hits = 0;
  let user: User | null = { name: 'world', age: 18 };
</script>

<main>
  <p>Hello {user!.name}!</p>
  <p>1 + 2 = {sum(1, 2)}</p>
  <p>Over legal drinking age: {isOldEnough(user!.age)}</p>
  <button on:click={() => hits++}>Hits {hits}</button>
  <button on:click={() => (hits += 10)}>Add 10 ({hits + 10})</button>
</main>
