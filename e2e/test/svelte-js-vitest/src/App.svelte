<script context="module">
  export function sum(a, b) {
    return a + b;
  }
  // This function is  exported, but will not be tested to see if it affects the no coverage statistic
  export function multiply(a, b) {
    return a * b;
  }
  export function isOldEnough(age) {
    return age >= 18;
  }
  /**
   * This loop will result in an infinite loop when Stryker mutates it.
   */
  export function loop(n, action) {
    let goOn = true;
    while (goOn) {
      action(n);
      n--;
      goOn = n > 0;
    }
  }
</script>

<script>
  let hits = 0;
</script>

<main>
  <p>Hello world!</p>
  <p>1 + 2 = {sum(1, 2)}</p>
  <p>Over legal drinking age: {isOldEnough(18)}</p>
  <button on:click={() => hits++}>Hits {hits}</button>
  <button on:click={() => (hits += 10)}>Add 10 ({hits + 10})</button>
</main>
