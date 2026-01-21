<script lang="ts">
  import { setContext } from 'svelte';

  import SheetHead from '$lib/components/Sheet/Sheet_head.svelte';
  import Row from '$lib/components/Sheet/Sheet_row.svelte';
  import NoData from '$lib/components/Sheet/Sheet_no_data.svelte';

  type RowT = Record<string, string | number | boolean | Date | null | undefined>;

  type PropsT = {
    rows: RowT[];
    dateColumns?: Record<string, string | undefined>;
    renameColumns?: Record<string, string>;
    detailsColumn?: Record<string, Function>;
    actionColumns?: Record<
      string,
      {
        actionName: string;
        onclick: Function;
        style?: { color?: string; backgroundColor?: string };
      }
    >;
  };

  const { rows, dateColumns, renameColumns, actionColumns, detailsColumn }: PropsT =
    $props();

  let columnNames: string[] = $state([]);
  if (rows && rows.length > 0 && typeof rows[0] === 'object') {
    columnNames.push(...Array.from(new Set(rows.map((r) => Object.keys(r)).flat())));
    if (actionColumns) {
      columnNames.push(...Object.keys(actionColumns));
    }
  }

  setContext('column names', () => columnNames);
  if (dateColumns) setContext('date columns', dateColumns);
  if (renameColumns) setContext('rename columns', renameColumns);
  if (actionColumns) setContext('action columns', actionColumns);
  if (detailsColumn) setContext('details column', detailsColumn);
</script>

<table>
  {#if columnNames.length === 0}
    <tbody>
      <NoData />
    </tbody>
  {:else}
    <SheetHead />
    <tbody>
      {#each rows as row, i (i)}
        {#if row[columnNames[0]] !== columnNames[0]}
          <Row dataObj={row} />
        {/if}
      {/each}
    </tbody>
  {/if}
</table>

<style>
  table {
    max-width: 100vw;
    border-collapse: collapse;

    white-space: nowrap;
  }
</style>
