<script lang="ts" context="module">
    function add(a: number, b: number) {
        return a + b;
    }
</script>

<script lang="ts">
    import type { Athlete } from './athlete.js';

    const athletes: Athlete[] = [
      { sport: "Athletics", name: "Alice", age: 16 },
      { sport: "Swimming", name: "Bob", age: 18 },
      { sport: "Tennis", name: "Charlie", age: 20 },
    ];
  
    let a = 0;
    let b = 0;
    $: count = a + b;
</script>

<main>
   <script lang="ts">
    function subtract(a: number, b: number) {
        return a - b;
    }
   </script>
</main>
  