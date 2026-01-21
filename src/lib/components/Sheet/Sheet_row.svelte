<script lang="ts">
  import Cell from '$lib/components/Sheet/Sheet_cell.svelte';
  import { getContext } from 'svelte';

  type PropsT = {
    dataObj: Record<string, string | number | boolean | Date | null | undefined>;
  };

  const { dataObj }: PropsT = $props();

  const colNames: () => string[] = $derived(getContext('column names'));
</script>

<tr>
  {#each colNames() as column, j (j)}
    {#if dataObj.hasOwnProperty(column) && dataObj[column] !== ''}
      <Cell row={dataObj} dataTuple={[column, dataObj[column]]} />
    {:else}
      <Cell row={dataObj} dataTuple={[column, '']} />
    {/if}
  {/each}
</tr>

<style>
  tr {
    border: var(--main-border);
    transition:
      transform 0.2s ease-in-out,
      background-color 0.5s ease-in-out;
  }

  tr:is(:hover, :focus-within, :active) {
    background-color: light-dark(
      hsl(from var(--main-bg-color) h s 80%),
      hsl(from var(--main-bg-color) h s 30%)
    );
    transform: scale(1.03);
  }
</style>
