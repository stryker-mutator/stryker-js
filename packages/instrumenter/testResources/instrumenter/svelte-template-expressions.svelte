<script>
    const athletes = [
      { sport: "Athletics", name: "Alice", age: 16 },
      { sport: "Swimming", name: "Bob", age: 18 },
      { sport: "Tennis", name: "Charlie", age: 20 },
    ];
  
    let a = 0;
    let b = 0;
    $: count = a + b;
</script>
  
<main>
    <button on:click={() => (a += 1)}>
        increase a: {a}
    </button>
    <button on:click={() => (b += 1)}>
        increase b: {b}
    </button>
    <button disabled={true}>
        disabled button
    </button>
    <p>{a} + {b} = {count}.</p>

    {#if a < 5}
        <p>a is lower than 5, it's: {a}</p>
    {:else if b < 5}
        <p>b is lower than 5, it's: {b}</p>
    {:else}
        <p>just right! total: {a + b}</p>
    {/if}

    <table>
        <tr>
        <td>sport</td>
        <td>name</td>
        <td>age</td>
        <td>of age</td>
        </tr>
        {#each athletes as athlete}
        {@const ofAge = athlete.age >= 18}
        <tr>
            <td>{athlete.sport}</td>
            <td>{athlete.name}</td>
            <td>{athlete.age}</td>
            <td>{ofAge ? "Yes" : "No"}</td>
        </tr>
        {/each}
    </table>
</main>
  